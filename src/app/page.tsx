

import CardGrid from "@/components/cards/CardGrid";
import { fetchProjects } from "@/lib/notion/projects";
import { fetchDevLogs } from "@/lib/content/devlog-source";
import { toCardItem } from "@/lib/content/mapper";

export default async function Home() {
  const projects = await fetchProjects();
  const projectCards = projects.map((project) => toCardItem(project, "/projects"));
  const devLogs = await fetchDevLogs();
  const devLogCards = devLogs.slice(0, 3).map((item) => toCardItem(item, "/devlog"));

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>Portfolio & DevLog</h1>
        <p>過去の制作物と現在の開発ログをひとつの場所で公開する、エンジニア向けポートフォリオサイトです。</p>
      </section>

      <section className="section-panel">
        <h2>Projects</h2>
        <CardGrid items={projectCards} emptyMessage="Projects are coming soon." />
      </section>

      <section className="section-panel">
        <h2>DevLog</h2>
        <CardGrid items={devLogCards} emptyMessage="DevLogs are coming soon." />
      </section>
    </main>
  );
}
