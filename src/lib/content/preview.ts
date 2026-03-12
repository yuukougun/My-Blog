import type { HomePreview } from "@/types/home";

export function getHomePreview(): HomePreview {
  return {
    introTitle: "Portfolio & DevLog",
    introDescription:
      "過去の制作物と現在の開発ログをひとつの場所で公開する、エンジニア向けポートフォリオサイトです。",
    projects: [
      {
        id: "project-sample-1",
        title: "Project Sample",
        summary: "Notion連携で公開されるプロジェクト記事のサンプルです。",
        href: "/projects/project-sample-1",
        image: "/image/icon_sky.png",
        publishedAt: "2026-03-12",
      },
    ],
    devlogs: [
      {
        id: "devlog-sample-1",
        title: "DevLog Sample",
        summary: "Zenn風の本文表示を備えた開発ログ記事のサンプルです。",
        href: "/devlog/devlog-sample-1",
        image: "/image/icon_sea.png",
        publishedAt: "2026-03-12",
      },
    ],
  };
}
