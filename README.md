# 角屋 公式Webサイト

愛知県小牧市の食堂「角屋」の公式Webサイトです。

## Website
- https://komaki-kadoya.com

## 構成
- `index.html` — ページ本体
- `style.css` — デザイン・レスポンシブ対応
- `script.js` / `script-base.js` — 表示・操作ロジック
- `images/` — 料理・店舗画像
- `videos/` — 店舗紹介動画
- `data/` — SEO等の運用データ
- `_headers` — Cloudflare Pages セキュリティヘッダー
- `CHANGELOG.md` — 主な変更履歴・運用メモ

## Hosting
Cloudflare Pages で公開しています。

## 更新履歴
主な修正内容と運用上の注意点は `CHANGELOG.md` に記録しています。

### 更新時の基本ルール
- 現行 `main` を基準に差分修正する。
- 料理写真は原則 4:3 で統一する。
- PC / スマホ両方で、写真サイズ・商品名・価格位置を確認する。
- GitHub反映後はCloudflare Pagesのデプロイと本番表示を確認する。
