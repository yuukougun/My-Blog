# リポジトリ構成と主要ファイル解説

主要なディレクトリ（抜粋）:

- `src/app/` — ルーティングとページ
  - `layout.tsx` — 全ページ共通レイアウト (ヘッダ／フッタを含む)
  - `page.tsx` — ホームページ
  - `devlog/[id]/` — 動的ルート（個別記事）

- `src/components/` — UI コンポーネント
  - `layout/Header.tsx` — サイト上部のナビ／ロゴ
  - `layout/Footer.tsx` — フッタ
  - `article/ArticleLayout.tsx` — 記事ページのテンプレート
  - `cards/ContentCard.tsx` — 記事一覧カード

- `content/` — Markdown の生ファイル（例: `content/devlog/*.md`）

- `lib/` — データの読み込み/変換ロジック
  - `lib/config/site.ts` — サイト名や説明などの設定
  - `lib/content/devlog-source.ts` — `content/devlog` をどう読み込むか
  - `lib/markdown/mapper.ts` — frontmatter をページデータ型に変換
  - `lib/markdown/rehype-plugins.ts`, `remark-plugins.ts` — Markdown パースプラグイン

- `src/styles/` — グローバル CSS とトークン
  - `globals.css`, `tokens.css`, `prose-zenn.css`

- `public/` / `image/` — 静的アセット（画像等）

- `types/` — TypeScript の型定義（記事データ型など）

よく編集するファイルと変更効果:

- `lib/config/site.ts` — サイトタイトル・デフォルトのメタを変更すると、HTML の title、OGP、ヘッダの表示に反映されます。
- `src/components/layout/Header.tsx` — ヘッダのテキストやナビリンクを追加・変更します。
- `src/styles/tokens.css` と `tailwind.config.ts` — 色やフォントのカスタムを行うと全体スタイルに影響します。
- `content/devlog/*.md` — 記事を追加/編集すると個別ページや一覧に反映されます（ビルド/再起動で SSG 反映）。
