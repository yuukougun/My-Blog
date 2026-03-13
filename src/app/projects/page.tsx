import CardGrid from "@/components/cards/CardGrid";
import { fetchProjects } from "@/lib/content/notion";
import { toCardItem } from "@/lib/content/mapper";


export default async function ProjectsPage() {
  const projects = await fetchProjects();
  // デバッグ用: 取得したprojects配列を出力
  // eslint-disable-next-line no-console
  console.log("projects", projects);
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
