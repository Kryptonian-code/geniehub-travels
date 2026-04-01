import type { ContentBlockRecord } from "./adminTypes";

export function getContentSection(contentBlocks: ContentBlockRecord[], sectionKey: string) {
  return contentBlocks
    .filter((item) => item.sectionKey === sectionKey && item.published && item.visible !== false)
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));
}

export function getManagedLinks(
  contentBlocks: ContentBlockRecord[],
  sectionKey: string,
  fallback: Array<{ label: string; path: string }>,
) {
  const items = getContentSection(contentBlocks, sectionKey)
    .map((item) => ({
      label: item.title,
      path: item.ctaHref || item.content,
    }))
    .filter((item) => item.label && item.path);

  return items.length ? items : fallback;
}
