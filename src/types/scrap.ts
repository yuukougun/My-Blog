export type ScrapSection = {
  title: string;
  content: string;
  children: ScrapSection[];
  date?: string;
};
