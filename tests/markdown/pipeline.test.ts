import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown/remark-plugins";

describe("renderMarkdown", () => {
  it("renders message blocks and generates toc entries", async () => {
    const markdown = "## Heading\n\n:::message info\nHello block\n:::";
    const result = await renderMarkdown(markdown);

    expect(result.toc[0].text).toBe("Heading");
    expect(result.html).toContain("message-block");
    expect(result.html).toContain("Hello block");
  });
});
