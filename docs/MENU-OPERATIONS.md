# お品書きとGoogleマップの運用

## メニューリンク

Googleビジネスプロフィールの「メニューのリンク先」には、次のURLを一度設定する。

https://komaki-kadoya.com/menu/

ホームページ用のウェブサイトURL https://komaki-kadoya.com/ は変更しない。
新しいURLではトップの演出を表示せず、お品書きから始まる。
Maps画面に表示されるドメイン名だけでは、実際のリンク先のパス・ハッシュを判定できない。

## HP変更時

- 元データは `index.html` の `#menu` と `#morning-menu`。料理名・価格・説明・写真はそこを編集する。
- `python scripts/build-menu-entry.py` で `menu/index.html` を生成する。生成先を手で編集しない。
- `script.js` / `script-base.js` による写真・価格等の補正もホームと共通で適用される。
- GitHubのmainへHP変更が入ると `Refresh menu landing page` がページを生成してコミットする。Cloudflare Pagesの公開完了後に反映される。
- 既存 `SEO Site Review` にも生成処理を接続。毎朝06:15 JSTの補完実行は、GitHub Actionsのコミットでは別Actionsが起動しないケースを回収する。
- 同期できない場合はGitHub Actionsを確認。成功ログだけでなく、公開した `/menu/` の料理名と価格も確認する。
- 通常の更新ではOAuth PlaygroundへのJSON貼り付けは不要。

## Google側の料理一覧との区別

この自動化の対象は、Mapsのメニューリンクから開くHPのお品書き。
Mapsに直接表示されるカテゴリー・料理名・価格（foodMenus API）は別データであり、ここでは自動同期しない。
`data/gbp/food-menus-2026-10-19.json` は作成時点のスナップショット。これを最新のHP価格と同一だと扱わない。
Googleへの書き込み成功やMaps公開状況は、API応答と実表示で別途確認する。

## 認証情報

Client secret・access token・refresh tokenは公開リポジトリやチャットに貼らない。
今後API同期を実装する場合はGitHub Actions Secrets等で管理し、実行ログに値を出さない。
今回のメニューリンク先ページの生成にはGoogleの認証情報は不要。
