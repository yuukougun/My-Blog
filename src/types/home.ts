import type { CardItem } from "@/types/content";

export type HomePreview = {
  introTitle: string;
  introDescription: string;
  projects: CardItem[];
  devlogs: CardItem[];
};
