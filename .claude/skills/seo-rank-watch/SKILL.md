# SEO Rank Watch

対象サイトのGoogle検索順位を継続的に改善する。

## 目的

1位を取れそうなキーワードを見つけ、検索ニーズに答える改善を1つ行い、7日間観察する。これを1位になるまで繰り返す。

## データ

- `data/seo/watchwords.json` — キーワード / 対象ページ / 優先度
- `data/seo/rank-history.json` — 順位履歴。追記専用
- `data/seo/improvement-log.json` — 改善履歴 / status / 次回レビュー日

status:
- `active` — 改善候補
- `observing` — 改善後7日間の観察中
- `achieved` — 1位達成。監視のみ

## Workflow

### 1. 順位を測る

原則としてGoogle Search Consoleを使用する。

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs \
  --repo <REPO_PATH> --append
```

GSCの平均順位・impressions・clicksを取得し、前回からの順位変動を確認する。
GSCが使えない場合や当日の順位を確認したい場合のみWebSearchを使う。WebSearch順位は概算であり、GSCを正とする。
`rank: null` + `impressions: 0` は未インデックスとは限らない。必要ならWebSearchで確認する。

### 2. 7日経過した改善をレビューする

`nextReviewDate <= 今日` のキーワードを確認する。
改善効果を見るときは28日平均ではなく7日GSCを使う。

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs \
  --repo <REPO_PATH> --days 7
```

- 1位 → `achieved`
- 改善したが1位未達 → `active`
- 効果なし → `active`。次回は前回と違う改善方法を使う

判定結果を `improvement-log.json` に記録する。

### 3. 今日改善するキーワードを1つ選ぶ

`observing` と `achieved` は除外する。以下の順で1キーワードだけ選ぶ。

1. 2〜10位 + impressionsあり — 1位に近いものを優先
2. 11〜20位 + impressionsが多い
3. 改善したが1位未達 / 効果なし
4. 高優先度の `rank: null`
5. GSCで見つかった有望な未登録クエリ

候補がなければ、順位チェックとレポートだけで終了する。改善するために無理やり対象を作らない。

### 4. 検索ニーズを分析する

改善前に必ず、

- 「誰が・何を知りたくて検索しているか」を1〜2文で定義
- WebSearchで現在の上位1〜3ページを確認
- 上位ページと対象ページを比較
- 検索ニーズに対して不足している情報をギャップとして特定

SEOのために文章量を増やすのではなく、検索ユーザーが欲しい情報を追加する。

### 5. 1つのキーワードを改善する

ギャップに応じて必要なものだけ実装する。

例:
- title / description / intro / FAQ改善
- 不足コンテンツの追加
- 記事 ↔ 地域ページ ↔ 詳細ページの内部リンク
- 不足している実データの追加

内部リンクはSEO目的だけでなく、検索ユーザーの「次に知りたい・やりたいこと」へ誘導する。
1回の実行で改善するキーワードは必ず1つだけ。
`noindex` 変更や大きなページ構造変更は勝手に適用せず、提案して承認を得る。

### 6. 改善を記録して7日待つ

`improvement-log.json` に以下を記録する。

```json
{
  "keyword": "...",
  "targetPath": "...",
  "status": "observing",
  "nextReviewDate": "今日+7日",
  "actions": [{
    "date": "...",
    "rankAtAction": 4.2,
    "needs": "検索ニーズ",
    "done": "実際に行った改善"
  }]
}
```

`data/seo/*.json` の変更はGitにコミットする。
`observing` のキーワードは `nextReviewDate` まで絶対に再改善しない。

## Report

最後に簡潔に報告する。

- 前回から大きく上昇 / 下降したキーワード
- 今回行った効果判定
- 今日選んだキーワードと選定理由
- 推測した検索ニーズ
- 実際に行った改善
- observing 中のキーワードと nextReviewDate

順位改善を予測で断定しない。何を変更したかを報告し、効果は次回の実測で判断する。

## Guardrails

- Google SERPを独自スクリプトでスクレイピングしない。GSCまたはWebSearchを使う
- 1回につき改善は1キーワードだけ
- observing の7日間クールダウンを厳守
- `rank-history.json` の過去データを書き換えない
- 認証キーや秘密情報を出力・コミットしない
- noindex や大きな構造変更は承認なしで適用しない
- 改善効果を断定しない
- 改善対象がなければ何もしない

「測定 → 1位に近いワードを1つ選ぶ → 検索意図を調べる → 改善 → 7日観察 → 実測で判定」
このループを、1位になるまで繰り返す。
