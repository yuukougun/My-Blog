export type ContentSource = "notion" | "zenn" | "markdown";

export type ContentBase = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string;
  publishedAt: string;
  tags?: string[];
};

export type ProjectItem = ContentBase & {
  source: "notion";
  repositoryUrl?: string;
  demoUrl?: string;
  bodyMarkdown: string;
};

export type DevLogItem = ContentBase & {
  source: "zenn" | "markdown";
  bodyMarkdown: string;
  status?: "idea" | "in-progress" | "done";
};

export type CardItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  image: string;
  publishedAt: string;
  tags?: string[];
};
