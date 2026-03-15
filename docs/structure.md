# リポジトリ構成と編集ガイド

## 主要ディレクトリ

- `src/app/`:
  - App Router のページ本体
  - `projects/[id]`, `devlog/[id]` は記事詳細ページ
  - `generateStaticParams.ts` で SSG 用のルートを生成

- `src/components/`:
  - `layout/`: ヘッダ、フッタ、モバイルメニュー
  - `cards/`: 一覧カード表示
  - `article/`: 記事ページ表示（本文、TOC、TOCボタン）

- `src/lib/content/`:
  - `notion.ts`: Project データ取得
  - `markdown.ts`: DevLog のローカル Markdown 取得
  - `zenn.ts`: DevLog の外部フィード取得
  - `devlog-source.ts`: DevLog ソース切替
  - `mapper.ts`: 生データからアプリ型へ変換

- `src/lib/markdown/`:
  - `remark-plugins.ts`: Markdown → HTML + TOC 生成

- `src/lib/hooks/`:
  - `useEscapeKey.ts`: ダイアログ系 UI の Escape 閉じる共通処理

- `src/content/`:
  - `about.md`: About ページ本文
  - `devlog/*.md`: DevLog のローカル記事

- `src/styles/`:
  - `tokens.css`: デザイントークン
  - `globals.css`: 共通スタイル
  - `zenn-custom.css`: 記事本文の見た目調整

- `tests/`:
  - `content/`, `markdown/`, `routes/` 単位でテスト配置

## 編集ルール（このリポジトリ向け）

- Markdown の変換ロジックは `src/lib/markdown/remark-plugins.ts` に集約する
- 記事ページの `summary` は Markdown として扱い、`renderMarkdown` で `summaryHtml` に変換して渡す
- Project/DevLog 一覧カードは `toCardItem` 経由で作る
- 環境変数は `.env.example` を正とし、実値は `.env` のみで管理する
