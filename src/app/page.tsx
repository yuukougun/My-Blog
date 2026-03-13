import CardGrid from "@/components/cards/CardGrid";
import { fetchProjects } from "@/lib/content/notion";
import { toCardItem } from "@/lib/content/mapper";

export default async function Home() {
  const projects = await fetchProjects();
  const cards = projects.map((project) => toCardItem(project, "/projects"));

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>Portfolio & DevLog</h1>
        <p>過去の制作物と現在の開発ログをひとつの場所で公開する、エンジニア向けポートフォリオサイトです。</p>
      </section>

      <section className="section-panel">
        <h2>Projects</h2>
        <CardGrid items={cards} emptyMessage="Projects are coming soon." />
      </section>
    </main>
  );
}
