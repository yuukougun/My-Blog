export type ScrapSection = {
  title: string;
  content: string;
  children: ScrapSection[];
  date?: string;
};

export async function extractScrapSections(html: string): Promise<ScrapSection[]> {
  // jsdomを動的にrequire
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const sectionNodes = doc.querySelectorAll('.ScrapThread_item__zTzyN');
  const sections: ScrapSection[] = [];

  sectionNodes.forEach((sectionNode: Element, idx: number) => {
    const parentArticle = sectionNode.querySelector('.ThreadItemContent_parentItem__2BweX');
    if (!parentArticle) return;
    const parentContent = parentArticle.querySelector('.ThreadItemContent_content__Ivb_O .BodyCommentContent_bodyCommentContainer__PFlLd');
    let contentHtml = parentContent ? parentContent.innerHTML : "";
    let title = "タイトルなし";
    let date: string | undefined = undefined;

    if (idx < 2) {
      // 要件・やることタブ: h1除去せずそのまま
      // タイトルも空でOK
    } else {
      // その他タブ: h1除去＆タイトル抽出＆日付取得
      if (contentHtml) {
        contentHtml = contentHtml.replace(/<h1[^>]*>.*?<\/h1>/is, "");
      }
      if (parentContent) {
        const h1 = parentContent.querySelector('h1');
        if (h1) {
          title = h1.textContent?.trim() || title;
        }
      }
      // 日付取得: sectionNode.parentElement内のThreadHeader_header__rscC4を検索
      if (sectionNode.parentElement) {
        const header = sectionNode.parentElement.querySelector('.ThreadHeader_header__rscC4');
        if (header) {
          const timeElem = header.querySelector('.ThreadHeader_dateContainer__349dg > time');
          if (timeElem) {
            date = timeElem.textContent?.trim() || undefined;
          }
        }
      }
    }

    // 子コメント
    const children: ScrapSection[] = [];
    const childrenRoot = parentArticle.querySelector('.ThreadItemContent_children__xggXO');
    if (childrenRoot) {
      const childArticles = childrenRoot.querySelectorAll('.ThreadItemContent_childItem__TC_O8');
      childArticles.forEach(childArticle => {
        const childContent = childArticle.querySelector('.ThreadItemContent_content__Ivb_O .BodyCommentContent_bodyCommentContainer__PFlLd');
        children.push({
          title: "",
          content: childContent ? childContent.innerHTML : "",
          children: [],
        });
      });
    }
    sections.push({
      title,
      content: contentHtml,
      children,
      ...(date ? { date } : {}),
    });
  });
  return sections;
}
