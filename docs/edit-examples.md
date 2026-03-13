# 具体的な編集例と手順

以下は「どこを編集すれば何が変わるか」を短い手順で示したものです。実際に編集する前にファイルをバックアップしておくと安心です。

1) サイト名・説明を変更する
   - 編集ファイル: `lib/config/site.ts`
   - 変更内容: `title`, `description`, `author` 等を編集
   - 反映方法: 保存後、開発サーバを再読み込み（`npm run dev`）または `npm run build` → `npm run start`

2) ヘッダにリンクを追加する
   - 編集ファイル: `src/components/layout/Header.tsx`
   - 変更内容: JSX の `<Link>`（または `<a>`）を追加。Tailwind のクラスで見た目を調整。
   - 注意: 追加したリンクが `lib/config/navigation.ts` を参照している場合はそちらも更新。

3) 全体の配色を変える
   - 編集ファイル: `src/styles/tokens.css`, `tailwind.config.ts`
   - 変更内容: カラートークン（CSS カスタムプロパティ）を上書き、また Tailwind の `theme.extend.colors` を調整。
   - 反映方法: CSS キャッシュの問題がある場合は開発サーバを再起動。

4) 新しい devlog 記事を追加する
   - 編集ファイル: `content/devlog/your-new-post.md`
   - 必須 frontmatter 例:
     ```yaml
     title: "記事タイトル"
     date: "2026-03-13"
     tags: [devlog]
     slug: "your-new-post"
     ```
   - 反映方法: `generateStaticParams.ts` が `content` を参照している場合、ビルド時に自動でページが生成されます。

5) 記事ページのテンプレートを変えたい（メタ表示や目次）
   - 編集ファイル: `src/components/article/ArticleLayout.tsx` と `src/components/article/Toc.tsx`
   - 変更内容: 必要なフィールド（例: `readingTime`）が mapper 側に無ければ、`lib/markdown/mapper.ts` にフィールド追加。

6) 外部 API（Notion など）をローカルで無効化して動かす
   - 実行例: `NOTION_ALLOW_MOCK=true npm run dev -- -p 3000`
   - 備考: 環境変数を利用してモックを使う実装になっているため、`lib/notion.ts` の条件分岐を確認すると良い。
