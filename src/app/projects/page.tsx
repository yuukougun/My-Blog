import CardGrid from "@/components/cards/CardGrid";
import { fetchProjects } from "@/lib/notion/projects";
import { toCardItem } from "@/lib/content/mapper";

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  const cards = projects.map((project) => toCardItem(project, "/projects"));

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>Projects</h1>
        <p>これまでに制作したプロダクトを一覧で紹介します。</p>
      </section>
      <section className="section-panel">
        <CardGrid items={cards} emptyMessage="No projects available." />
      </section>
    </main>
  );
}
