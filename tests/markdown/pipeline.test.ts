import { describe, expect, it } from "vitest";
import { renderArticleHtml } from "@/lib/markdown/rehype-plugins";

describe("renderArticleHtml", () => {
  it("renders message blocks and generates toc entries", async () => {
    const markdown = "## Heading\n\n:::message info\nHello block\n:::";
    const result = await renderArticleHtml(markdown);

    expect(result.toc[0].text).toBe("Heading");
    expect(result.html).toContain("message-block");
    expect(result.html).toContain("Hello block");
  });
});
