import { describe, expect, it } from "vitest";
import { mapNotionProject } from "@/lib/content/mapper";

describe("mapNotionProject", () => {
  it("fills defaults when optional fields are missing", () => {
    const project = mapNotionProject({ id: "1" });

    expect(project.slug).toBe("1");
    expect(project.title).toBe("Untitled Project");
    expect(project.summary.length).toBeGreaterThan(0);
    expect(project.coverImage).toBe("/image/icon_whale.png");
    expect(project.bodyMarkdown).toContain("Coming soon");
  });
});
