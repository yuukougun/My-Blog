# My-Blog Repository Guide for AI Agents

このドキュメントは、AI（バイブコーディング等）がこのリポジトリを編集する際の詳細なガイドラインとリポジトリ構造の説明です。
スパゲッティコードの発生を防ぎ、拡張性とメンテナンス性の高いモダンなアーキテクチャを維持するため、以下の規則を厳守してください。

## 1. リポジトリの概要

本リポジトリは、エンジニア個人のポートフォリオ兼技術ブログ（DevLog）サイトを構築するためのフロントエンドプロジェクトです。
Notion APIなどをデータソース（Headless CMS）として利用し、静的サイト生成(SSG)を行ってデプロイします。

- **フレームワーク**: Next.js (App Router)
- **スタイリング**: Tailwind CSS および Vanilla CSS (`src/styles/`ディレクトリ内)
- **ホスティング**: Azure Static Web Apps (`next.config.js`にて `output: "export"` 指定)
- **主要なデータソース**: Notion API (Projects, DevLog) / ローカルMarkdownファイル

## 2. ディレクトリ構成

主要な構成は以下の通りです。必ず各ファイルの役割に応じたディレクトリに配置してください。

```text
My-Blog/
├── src/
│   ├── app/           # Next.js App Router: ルート定義、ページコンポーネント (/, /projects, /devlogなど)
│   ├── components/    # 共通・再利用可能なReactコンポーネント群
│   │   ├── article/   # 記事表示に関するもの (レイアウト、TOC、ScrapTabPanelなど)
│   │   ├── cards/     # カードUI (Project, DevLog一覧など)
│   │   └── icons/     # SVGアイコン群 (機能・デザイン単位でコンポーネント化)
│   ├── lib/           # ビジネスロジック、ユーティリティ、API連携処理
│   │   ├── content/   # データマッピング、画像生成、Markdownパースの補助
│   │   ├── markdown/  # remark/rehypeを利用したAST処理・HTML変換パイプライン
│   │   └── notion/    # Notion APIのクライアント初期化、データベースクエリ、共通抽出関数
│   ├── styles/        # Vanilla CSSファイル群 (globals.cssにてすべてimport)
│   └── types/         # プロジェクト全体で共有するTypeScript型定義
├── docs/              # ドキュメントディレクトリ（本ファイルなど）
├── public/            # 静的アセット (画像、Webフォントなど)
├── tests/             # Vitestによるユニットテスト
├── next.config.js     # Next.jsビルド設定
└── package.json       # パッケージ・スクリプト定義
```

---

## 3. AIによるコード生成・編集の詳細規則（スパゲッティコード防止）

AIエージェントによる自動コーディングを行う際は、以下のアーキテクチャ・コーディング・フォーマット規則を遵守してください。全体像を俯瞰した上で、局所的なパッチ当てではなく、根本的な修正を行ってください。

### 3.1. アーキテクチャと関心の分離 (Separation of Concerns)

1. **Server Components と Client Components の使い分け**
   - 原則として、データフェッチを含むページ・コンポーネントは **Server Components** として実装してください。
   - 状態管理 (`useState` 等) やブラウザAPI (`useEffect`, `window`) が真に必要なコンポーネントのみ、ファイルの先頭に `"use client";` を宣言して **Client Components** にしてください。
   - Client Componentのサイズは最小限に抑え、子としてServer Componentを渡す（`children` props）設計を検討してください。
2. **ロジックとUIの完全な分離**
   - Reactコンポーネント (`.tsx`) の中に、複雑なデータマッピング、NotionからのASTパース、外部APIリクエストなどのビジネスロジックを直接書かないでください。
   - ロジックは必ず `src/lib/` 以下のファイル（純粋なTypeScriptファイル）として実装・テストし、コンポーネントからはそれを呼び出して値を受け取るだけにしてください。

### 3.2. TypeScriptの型定義に関する規則

1. **`any` の原則禁止**
   - 型が不明な場合は `unknown` を使用し、適切に型ガード（Type Guards）やバリデーションを行ってから安全にキャストしてください。
2. **型の集約と分離**
   - 複数ファイルで使い回す型（例: `ProjectItem`, `DevLogItem`, `ScrapSection`）は必ず `src/types/` 以下に配置してください。
   - 各ファイルの冒頭や途中に、そのファイルでしか使わない簡単な Props 以外の共通型をインラインで定義しないでください。
3. **安全なオプショナルチェーンとNull/Undefined処理**
   - Notion APIのように動的なレスポンスを扱う場合、プロパティが欠落している可能性を常に考慮してください。安全なフォールバック値（Fallback）を用意し、レンダリングエラーを防いでください。

### 3.3. コンポーネントおよびファイルの粒度制限 (DRY & SRP)

1. **ファイル長と単一責任の原則 (SRP)**
   - 1つのファイルの行数が **150〜200行を超える場合** は、コンポーネントの責務が多すぎるサインです。責務（レイアウト、ロジック、UIの描画）ごとに新しいファイルに分割してください。
   - React Hooksが複雑になった場合は、`useXXX.ts` のようなカスタムフックとして別ファイルに抽出してください。
2. **インラインSVGの直接記述禁止**
   - `ArticleLayout` や `ContentCard` などのメインコンポーネント内に、数十行に及ぶ `<svg>...</svg>` タグを直接ハードコーディングしないでください。
   - SVGが必要な場合は `<CalendarIcon />` のように `src/components/icons/` 配下にコンポーネントとして切り出し、再利用可能な形でProps（`size`, `color` 等）を受け取れるようにしてください。

### 3.4. スタイリング規則

1. **インラインスタイルの絶対禁止**
   - `style={{ display: "flex", margin: "10px" }}` といったインラインでのスタイル適用は原則として禁止します。
2. **クラスベースでのスタイリング**
   - スタイルは `src/styles/` 以下のVanilla CSSファイル内で適切にクラス定義（例: `.content-card-title`）を行うか、Tailwind CSS のユーティリティクラスを使用して指定してください。
   - 新しいCSSクラスを追加した場合は、役割ベースで適切なCSSファイル（`layout.css`, `card.css`, `article.css` 等）に分類してください。
3. **Zennスタイルの適用**
   - 記事のコンテンツ（Markdownから変換されたHTML）を描画するラッパーには `className="znc"` を指定し、`zenn-content-css` および `zenn-custom.css` が適用されるように遵守してください。

### 3.5. 命名規則 (Naming Conventions)

1. **ファイルとディレクトリ**
   - Reactコンポーネントファイル: `PascalCase.tsx` (例: `ContentCard.tsx`)
   - ユーティリティ・ロジック関数ファイル: `camelCase.ts` または `kebab-case.ts` (例: `remark-plugins.ts`, `generateTopImage.ts`)
   - Next.jsルーティング: `kebab-case` フォルダ (例: `src/app/projects/[id]/page.tsx`)
2. **コード内部**
   - 変数名・関数名: 名詞または動詞から始まる `camelCase` (例: `fetchProjects`, `isDesktop`)
   - 型名・インターフェース名: `PascalCase` (例: `ProjectItem`, `TocItem`)
   - 定数: `SCREAMING_SNAKE_CASE` (例: `SANITIZE_SCHEMA`, `REQUIRED_NOTION_ENV`)

### 3.6. エラーハンドリングとリトライ

1. **非同期リクエストの回復力**
   - ネットワークリクエスト（特にNotion API等の外部通信）を行う際は、一時的なエラーに備え、すでに実装されている `withRetry` (指数的バックオフを伴う再試行) などのユーティリティを活用してください。
2. **モックフォールバック**
   - ビルド環境等でNotionクレデンシャルが存在しない場合に備え、`NOTION_ALLOW_MOCK` のような環境変数を考慮し、ローカル開発・テスト用途にダミーデータで安全にフォールバック（Graceful Degradation）する実装を維持してください。

### 3.7. 破壊的変更とリファクタリングの姿勢

1. **大胆な整理を恐れない**
   - スパゲッティ状態になりつつあるコードを発見した場合、「元からこうだったから」と既存の汚いコードにパッチを当てるだけの修正はしないでください。
   - Gitの履歴でロールバック可能であるため、共通化できるロジックや冗長なコードがあれば、ファイルを移動・削除・新規作成するなどして **「大胆かつ完全に整理」** を行ってください。
2. **整合性の維持**
   - ロジックを抽出しファイルを移動させた場合は、プロジェクト全体の import パスの更新を怠らないでください。必ず `npm run typecheck` を通る状態（Type Safe）を維持し、壊れたまま放置しないでください。
