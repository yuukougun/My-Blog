# 実務ハンドブック: 開発・ビルド・記事追加の手順

開発サーバ起動（Notion mock を使う例）:

```bash
NOTION_ALLOW_MOCK=true npm run dev -- -p 3000
```

通常の開発:

```bash
npm run dev
```

ビルド:

```bash
npm run build
```

本番起動 (ビルド後):

```bash
npm run start
```

テスト実行（このリポジトリは `vitest` を使っている可能性があります）:

```bash
npm run test
```

新しい記事を追加する流れ:
1. `content/devlog/` に Markdown ファイルを作成。
2. frontmatter（title/date/slug 等）を記入。
3. ローカルで `npm run dev` を動かして動作確認、問題なければ `npm run build` で SSG を検証。

よく使うコマンドまとめ:

- `npm run dev` — 開発サーバ
- `npm run build` — 本番ビルド（静的ファイル生成）
- `npm run start` — ビルド後の起動
- `NOTION_ALLOW_MOCK=true ...` — Notion API をモックして起動
