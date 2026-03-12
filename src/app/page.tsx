import CardGrid from "@/components/cards/CardGrid";
import { getHomePreview } from "@/lib/content/preview";

export default function Home() {
  const preview = getHomePreview();

  return (
    <main className="page-wrap">
      <section className="hero-panel">
        <h1>{preview.introTitle}</h1>
        <p>{preview.introDescription}</p>
      </section>

      <section className="section-panel">
        <h2>Projects Preview</h2>
        <CardGrid items={preview.projects} emptyMessage="Projects are coming soon." />
      </section>

      <section className="section-panel">
        <h2>DevLog Preview</h2>
        <CardGrid items={preview.devlogs} emptyMessage="DevLogs are coming soon." />
      </section>
    </main>
  );
}
