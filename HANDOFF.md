# 角屋Webサイト 引き継ぎメモ

更新日: 2026-10-01
対象リポジトリ: `mami0803682808-ui/kadoya-website`
作業ブランチ: `main`

## 目的
このファイルは、別のChatGPTアカウント・別AI・別セッションでも、角屋Webサイトの最新状態から作業を再開できるようにするための引き継ぎメモです。

## まず最初にやること
1. `main` の最新状態を取得する。
2. `README.md` とこの `HANDOFF.md` を読む。
3. 直近コミットを確認し、古い版へ戻さない。
4. 修正は現在の `index.html` / `style.css` / `script-base.js` / `script.js` をベースに行う。

## 現在までに反映済みの主な修正
- 料理写真を多数追加済み。
- きしめん系カードの写真サイズ・価格・ラベル位置を統一する修正を実施済み。
- とり天・きのこ天等の写真サイズ／見切れを調整済み。
- 夏季限定メニューの写真・キャプション位置を調整済み。
- 丼もの等の重複表示を整理済み。
- 単品料理の写真追加・表示調整を実施済み。
- モーニングのメニュー表記を修正済み。
- リッチチョコフラッペは削除済み。
- 「1番粉を使用」など、削除指示があった文言は復活させない。
- 商品ごとの不要な番号表記（03等）は復活させない。
- Coming Soon は必要箇所以外に増やさない。

## デザインルール
- 同じカテゴリ内では、写真の表示サイズを揃える。
- 商品名の縦位置・文字サイズ・価格位置を揃える。
- 写真だけ極端に大きいカードを作らない。
- 料理が見切れすぎないよう `object-position` 等を個別調整してよい。
- ホバー時の動きは、定食以外の写真にも統一感を持たせる。
- 見出しサイズ・余白・左右位置もページ全体で統一する。
- 背景が意図せずスクロールやホバーで動かないよう注意する。

## メニュー関連の注意
- 秋季／冬季／夏季などの季節メニュー用タブやプルダウンを、古いコードで消さないこと。
- 年越し蕎麦は Coming Soon 表示を使用し、12/31提供・最新情報はInstagram案内という方針。
- 夏季限定については「6〜9月を目安。ただし時期は変動する場合あり」というニュアンスで、店舗への問い合わせを強く促す文言は避ける。
- 瓶ビール等、既に修正された飲み物情報を過去版で上書きしない。

## 直近コミットの例
- `Remove rich chocolate frappe from morning menu`
- `Add missing ham toast at 800 yen and match morning sandwich menu wording`
- `Add five side-dish photos with consistent captions and list ham sandwich explicitly`
- `Remove duplicate donburi text entries`
- `Unify eight kishimen cards and add six missing tax-inclusive prices`
- `Align kishimen photo frames and price typography`
- `Match tempura photos to seasonal card sizes and prevent clipping`
- `Remove ichibanko wording from runtime copy`

## 次の作業者への重要な指示
見た目の修正をする際は、1か所だけ直して別のカテゴリを崩さないこと。特に、過去版の `style.css` や `script` を丸ごと戻すと、季節メニュー・写真サイズ・価格表示・削除済み文言が復活する可能性があるため、差分ベースで修正すること。

写真を新規追加する場合は、既存カードのHTML構造とCSSクラスを流用し、写真サイズ・商品名・価格・ホバー挙動を既存カードに合わせること。
