export type ScrapSection = {
  content: string;
  children: ScrapSection[];
};

export async function extractScrapSections(html: string): Promise<ScrapSection[]> {
  // jsdomを動的にrequire
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const sectionNodes = doc.querySelectorAll('.ScrapThread_item__zTzyN');
  const sections: ScrapSection[] = [];

  sectionNodes.forEach(sectionNode => {
    const parentArticle = sectionNode.querySelector('.ThreadItemContent_parentItem__2BweX');
    if (!parentArticle) return;
    const parentContent = parentArticle.querySelector('.ThreadItemContent_content__Ivb_O .BodyCommentContent_bodyCommentContainer__PFlLd');
    const contentHtml = parentContent ? parentContent.innerHTML : "";
    // 子コメント
    const children: ScrapSection[] = [];
    const childrenRoot = parentArticle.querySelector('.ThreadItemContent_children__xggXO');
    if (childrenRoot) {
      const childArticles = childrenRoot.querySelectorAll('.ThreadItemContent_childItem__TC_O8');
      childArticles.forEach(childArticle => {
        const childContent = childArticle.querySelector('.ThreadItemContent_content__Ivb_O .BodyCommentContent_bodyCommentContainer__PFlLd');
        children.push({
          content: childContent ? childContent.innerHTML : "",
          children: [],
        });
      });
    }
    sections.push({
      content: contentHtml,
      children,
    });
  });
  return sections;
}
