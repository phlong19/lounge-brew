import type { MenuPage } from "@/types/domain";

const groups = [
  {
    id: "wine",
    members: ["wine", "spirits"],
    vi: "Rượu",
    en: "Wine & spirits",
  },
  { id: "snacks", members: ["snacks", "beer"], vi: "Đồ ăn nhẹ", en: "Snacks" },
  {
    id: "appetisers",
    members: ["food", "appetisers"],
    vi: "Khai vị & salad",
    en: "Appetisers & salads",
  },
  { id: "meat", members: ["beef-pork", "chicken"], vi: "Món chính", en: "Main dishes" },
] as const;
export type MenuBookmark = {
  id: string;
  label: string;
  page: number;
  pages: number[];
};
/** Groups navigation only; the authentic page order and URLs remain unchanged. */
export function menuBookmarks(
  pages: MenuPage[],
  english = false,
  includeCovers = false,
): MenuBookmark[] {
  const result: MenuBookmark[] = [],
    seen = new Set<string>();
  pages.forEach((item) => {
    if (
      !includeCovers &&
      ["cover", "welcome", "thanks", "back"].includes(item.id)
    )
      return;
    const group = groups.find((group) =>
      (group.members as readonly string[]).includes(item.id),
    );
    if (group) {
      if (seen.has(group.id)) return;
      seen.add(group.id);
      const members = pages.flatMap((page) =>
        (group.members as readonly string[]).includes(page.id) ? [page.physicalIndex] : [],
      );
      result.push({
        id: group.id,
        label: english ? group.en : group.vi,
        page: members[0],
        pages: members,
      });
    } else
      result.push({
        id: item.id,
        label: item.label,
        page: item.physicalIndex,
        pages: [item.physicalIndex],
      });
  });
  return result;
}
