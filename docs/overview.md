# 基本知識: TypeScript / React / Next.js / Tailwind

このプロジェクトを理解・編集するために役立つ最低限の知識を簡潔にまとめます。

- TypeScript
  - JavaScript に型注釈を付けた言語です。拡張子は `.ts` / `.tsx`。
  - 型エラーがあるとビルドや IDE が警告します。短期対応で `any` を使うこともできますが、型定義を更新するのが望ましいです。

- React
  - UI をコンポーネント（関数）単位で作成します。JSX を返す関数がコンポーネントです。
  - Props（引数）に型（interface/type）を付けます。

- Next.js（App Router）
  - `src/app/` 配下の `page.tsx` がページ、`layout.tsx` がレイアウトを定義します。
  - 動的ルートは `[id]` のようなフォルダで扱い、`generateStaticParams.ts` で SSG のパスを決められます。

- Tailwind CSS
  - ユーティリティクラスでスタイル指定を行います。設定ファイルは `tailwind.config.ts`。
  - グローバルな CSS は `src/styles/globals.css`、デザイントークンは `src/styles/tokens.css` にまとめられています。

- Markdown コンテンツの流れ
  - 生の Markdown は `content/` フォルダに置きます。
  - `lib/markdown` のパイプライン（remark/rehype プラグイン）で HTML に変換され、`lib/content/*` のソース読み込みロジックでページデータにマッピングされます。

これらの概念が分かれば、コンポーネントの編集、スタイルの調整、記事追加などの基本作業が行えます。
