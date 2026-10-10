# 角屋 SEO運用

確認画面：https://komaki-kadoya.com/seo/ （検索対象外。公開リポジトリと同じ集計データを表示。認証管理画面ではありません）

## 先に必要な認証修復

2026-10-10 07:30 JSTの既存Actions実行は、`GSC_PRIVATE_KEY has no complete PEM key` で失敗。
秘密鍵は壊れた値から復元できない。Google Cloudで発行したサービスアカウントJSONの原本を、GitHub Settings → Secrets and variables → Actions → **GSC_SERVICE_ACCOUNT_JSON** に全体として登録する。チャットやGitに貼らない。

- JSON内のclient_emailをSearch Consoleの対象プロパティのユーザーに追加する。
- Google CloudでSearch Console APIを有効にする。
- 原則 `sc-domain:komaki-kadoya.com`。URLプレフィックス型ならActionsのRepository variable **GSC_SITE_URL** に登録されている正確なプロパティを設定する。
- 古いGSC_CLIENT_EMAILが別アカウントなら削除・更新する。JSONのメールと不一致なら安全に停止する。
- 既存のGSC_CLIENT_EMAIL + GSC_PRIVATE_KEY形式も利用可。
- Actions → SEO Rank Watch → Run workflow → monthly=true を実行する。
- OAuth、API取得、履歴コミットが全部成功し、rank-history.jsonにsource:gscの実測値が入って初めて接続完成と判定する。キー設定だけでは完成扱いにしない。

## 日次と月次

- 毎日07:15 JST：確定データがある最新日を探し、28日間の平均順位・表示回数・クリック数・CTRを保存。GSCの日付境界は米国太平洋時間。
- 検索語＋ページの実測値と、同じ検索語のプロパティ全体実測値を別APIクエリで記録。ページ変更前後の混同を防ぐ。
- 毎月6日08:15 JST：前月と前々月を別々に取得。重ならない期間から改善候補と施策の観察結果を `data/seo/monthly/YYYY-MM.json` / `.md` へ保存。
- 平均順位が2以上悪化、クリック20%以上減少（比較月5クリック以上）、20位以内でCTR3%未満、新しい検索語を候補化（最低30表示）。基準はヒューリスティックで、必ず改善すべきという意味ではない。
- 月次は候補抽出と記録を自動化する。店舗の事実や料理価格を書き換える処理はしない。
- 変更後28日間は同じページの改善候補を除外。施策を含まない比較前期間と、施策後だけの期間が揃ってから変化を記録。ページ新設で前データがなければinsufficient_data。
- GSCの匿名化・上位行制限により検索語合計は全体と一致しない。APIの返却行はページングで取得するがGoogle側の上限は回避できない。候補の完全網羅や固定順位は保証しない。
- no_dataのnullを圏外・未インデックス・0クリックと断定しない。実際に返った0クリックは0を保存。認証やAPIエラーは履歴を追加せず失敗として記録される。

## 料理ページ

`/kishimen/`、`/morning/`、`/misonikomi/`、`/teishoku/`、`/misokatsu/`、`/dengaku/`。
トップページから価格・料理写真・店舗案内を生成する。価格変更時は **index.htmlを更新**し、`python scripts/build-menu-pages.py`。サイト変更のActionsでも再生成する。
各ページに固有のtitle・説明・canonical・パンくず構造化データ・関連ページリンクを入れ、サイトマップに登録。

## 画像と表示速度

- 大きい33枚の写真に640px/1200pxのWebPを生成。元の写真や拡大リンクは保持。画像内容・構図は変えず、縮小と品質82で圧縮する（非可逆）。
- 初期画面外の2本の動画は接近時に読み込み、画面外で停止。省データ・動き抑制時は手動再生。
- `image-optimization.json` に元写真と各圧縮版のバイト数。
- `media-before.json` は変更前の参照容量、`media-audit.json` は現行全参照容量（オリジナルとsrcset双方を含む）。後者を初期通信量と混同しない。
- SEO Site Reviewがサイト変更時と毎月6日08:30 JSTに、現行ソースのmobile/desktop Lighthouseを実行。LCP/CLS/TBT/転送容量を履歴・Artifactsに保存。
- localhostのラボ測定なのでCloudflare CDN、外部画像の実通信、実ユーザーのCore Web Vitalsを直接表さない。本番のPageSpeed Insightsも適宜確認する。
- 更新コミット・変更ファイル・変更前の直近GSC値をimprovement-log.jsonに自動記録。GitHub Actionsによる生成物コミットは次のワークフローを再起動しない。

## 検証コマンド

```
node --test tests/seo.test.mjs
python scripts/validate-site.py
node scripts/seo/collect.mjs --append --monthly
```

Google公式API仕様：https://developers.google.com/webmaster-tools/v1/searchanalytics/query
データ制限：https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data
