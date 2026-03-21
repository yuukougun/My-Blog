import { Client } from "@notionhq/client";

const REQUIRED_NOTION_ENV = ["NOTION_TOKEN", "NOTION_PROJECTS_DATABASE_ID"] as const;

export function assertNotionEnv(
  requiredKeys: readonly string[] = REQUIRED_NOTION_ENV,
) {
  const missing = requiredKeys.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `[Notion] Missing required environment variables: ${missing.join(", ")}. Configure these before running static build.`,
    );
  }
}

export function getNotionClient() {
  assertNotionEnv(["NOTION_TOKEN"]);
  return new Client({ auth: process.env.NOTION_TOKEN });
}

// ── Notion property extractors ──

export function getTextFromTitleProperty(
  property: unknown,
): string | undefined {
  if (!property || typeof property !== "object" || !("title" in property)) {
    return undefined;
  }
  const title = (property as { title?: Array<{ plain_text?: string }> }).title;
  if (!title || title.length === 0) {
    return undefined;
  }
  return title.map((item) => item.plain_text ?? "").join("");
}

export function getTextFromRichTextProperty(
  property: unknown,
): string | undefined {
  if (
    !property ||
    typeof property !== "object" ||
    !("rich_text" in property)
  ) {
    return undefined;
  }
  const richText = (
    property as { rich_text?: Array<{ plain_text?: string }> }
  ).rich_text;
  if (!richText || richText.length === 0) {
    return undefined;
  }
  return richText.map((item) => item.plain_text ?? "").join("");
}

export function getMultiSelectNames(
  property: unknown,
): string[] | undefined {
  if (
    !property ||
    typeof property !== "object" ||
    !("multi_select" in property)
  ) {
    return undefined;
  }
  const value = (
    property as { multi_select?: Array<{ name?: string }> }
  ).multi_select;
  if (!value || value.length === 0) {
    return undefined;
  }
  return value
    .map((item) => item.name)
    .filter((name): name is string => typeof name === "string");
}
