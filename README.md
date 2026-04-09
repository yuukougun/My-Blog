# Portfolio & DevLog Website Requirements

My Blogのwebサイト（まだ開発中）  
https://gentle-island-056a8c700.6.azurestaticapps.net

## 1. プロジェクト概要
本プロジェクトは、エンジニア個人のポートフォリオ兼技術ブログ（DevLog）サイトの開発である。  
過去の制作物（Projects）と現在進行形の開発記録（DevLog）を管理・公開することを目的とする。  
コンテンツの管理は外部サービス（Notion, Zenn）で行い、静的サイトとしてビルドして公開するモダンな構成を採用する。
Notionの情報は`Notion API`、Zenn Scrap記事は`Web Scraping`により取得する。

バイブコーディングを体験するため、開発やデバックは基本的にAIを通して行う。

## 2. 技術スタック
AIエージェントは以下の技術スタックを前提にコードを生成すること。
* **Framework:** Next.js (App Router) または Astro （静的サイト生成(SSG)を前提とする）
* **Styling:** Tailwind CSS
* **Content Source:**
  * Projects: Notion API
  * DevLog: Zenn Scrap (またはマークダウンファイル)
* **Markdown Parser:** `remark` / `rehype` エコシステム (Zenn風の独自マークアップ拡張を実装するため)
* **Hosting:** Azure Static Web Apps (デプロイ済み、GitHub ActionsでCI/CD構築済)

## 3. サイト構造とページ要件 (WebPage.png 参照)
サイトは以下の4つのメインページと、それぞれの詳細ページで構成される。

### 3.1. HOME (`/`)
* **役割:** サイトのトップページ。簡単な自己紹介とサイトの説明。
* **コンテンツ:**
  * 自己紹介・サイト説明文
  * Projectsの最新一覧プレビュー（セクションとして表示）
  * DevLogの最新一覧プレビュー（セクションとして表示）

### 3.2. Project (`/projects`)
* **役割:** 過去に作成したプロダクトの紹介ページ。
* **データソース:** Notionのデータベースからデータを取得。
* **コンテンツ:**
  * Projectページの説明文
  * プロダクト一覧（サムネイル画像、タイトル、簡易説明を含むカード型のブロック表示）
* **更新要件:** GitHub Actionsを用いた日次の自動ビルド・デプロイ処理で最新状態を取得する。

### 3.3. DevLog (`/devlog`)
* **役割:** 現在開発中のプロダクトの試行錯誤や記録を載せるページ。
* **データソース:** Zennのスクラップ機能、またはリポジトリ内の拡張マークダウン。
* **コンテンツ:**
  * DevLogページの説明文
  * 開発ログ一覧（サムネイル画像、タイトル、簡易説明を含むカード型のブロック表示）
* **更新要件:** Project同様、GitHub Actionsを用いた自動ビルドで最新状態を反映する。

### 3.4. About (`/about`)
* **役割:** 自身の経歴、スキルセットなどを記載するページ。
* **コンテンツ:**
  * 自己紹介テキスト、技術スタック等（マークダウンによる静的記述）

### 3.5. 詳細ページ (`/projects/[id]`, `/devlog/[id]`)
* **役割:** 各プロダクトや開発ログの個別記事ページ。
* **コンテンツ:**
  * タイトル画像（カバー画像）
  * タイトル、簡易的な説明
  * 目次 (Table of Contents / TOC)
  * マークダウンによって生成された記事本文（Zennの記事のようなデザイン）

## 4. UI / UX レイアウト要件 (WebPageDesign.png 参照)
* **ヘッダー (共通):** 
  * 左側にサイトのアイコンとタイトル。
  * 右側にハンバーガーメニュー（レスポンシブ対応、モバイルでのナビゲーション用）。
* **カードレイアウト:** Projects / DevLog の一覧画面は、グリッド状に並ぶカードUIで実装すること。
* **フッター (共通):** 
  * 一言メッセージ、ソーシャルリンク（GitHub, X等）を配置。
* **記事デザイン (Zenn風マークアップ):**
  * 本文の表示はZennをリスペクトしたUIにすること。
  * 独自のメッセージブロック（`:::message` などの記法）や、コードブロックのシンタックスハイライト、リンクカードのOGP表示を実装すること。

## 5. データフェッチとパフォーマンス要件
* **Notion APIの制限回避:** デプロイ時（ビルド時）にのみNotion API及び外部APIを叩き、静的なHTMLとして生成すること（SSG）。クライアントサイドでの都度フェッチは行わない。
* **ビルド最適化:** ページ数増加に備え、Next.jsのISR（Incremental Static Regeneration）やビルドキャッシュを適切に設定し、ビルド時間とAPIコール数を最小限に抑えること。

## 6. デプロイメント・CI/CD
* **ホスティング先:** Azure Static Web Apps
* **設定ファイル:** 既存の `azure-static-web-apps-gentle-island-056a8c700.yml` を使用。
* （※AIへの指示：ビルドコマンドが見つからないエラーを防ぐため、`package.json` には適切な `build` スクリプトを定義し、Azure SWAがSSGの出力ディレクトリ（`out` または `dist`）を正しく参照できるように設定すること。）

---

## Development Quickstart

### 1) Install dependencies

```bash
npm install
```

### 2) Local development

```bash
npm run dev
```

### 3) Run tests

```bash
npm test
```

### 4) Static build (local fallback)

Notion連携を未設定のローカル環境でビルド確認する場合:

```bash
NOTION_ALLOW_MOCK=true npm run build
```

### 5) Production build (strict)

本番では以下の環境変数を設定してください。

- `NOTION_TOKEN`
- `NOTION_PROJECTS_DATABASE_ID`
- `DEVLOG_SOURCE` (`markdown` または `zenn`)
- `ZENN_FEED_ENDPOINT`（`DEVLOG_SOURCE=zenn` の場合）

```bash
npm run build
```

### 6) Azure Static Web Apps

- ワークフロー: `.github/workflows/azure-static-web-apps-gentle-island-056a8c700.yml`
- Next.js `output: "export"` で `out/` を生成
- SWA の `output_location` は `out` を参照
- 日次再ビルドのために cron スケジュールを設定済み