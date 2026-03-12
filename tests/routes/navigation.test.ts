import { describe, expect, it } from "vitest";
import { navigationItems } from "@/lib/config/navigation";

describe("navigationItems", () => {
  it("contains required main routes", () => {
    const hrefs = navigationItems.map((item) => item.href);

    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/projects");
    expect(hrefs).toContain("/devlog");
    expect(hrefs).toContain("/about");
  });
});
