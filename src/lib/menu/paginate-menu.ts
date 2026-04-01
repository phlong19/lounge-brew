import type {MenuPage, MenuSection} from '@/types/domain';

const ITEMS_PER_PAGE = 4;

type BuildMenuPagesOptions = {
  coverTitle: string;
  coverSubtitle: string;
  backQuote: string;
};

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let startIndex = 0; startIndex < items.length; startIndex += size) {
    chunks.push(items.slice(startIndex, startIndex + size));
  }

  return chunks;
}

export function buildMenuPages(
  sections: MenuSection[],
  {coverTitle, coverSubtitle, backQuote}: BuildMenuPagesOptions
): MenuPage[] {
  const pages: MenuPage[] = [
    {
      id: 'cover',
      physicalIndex: 0,
      bookPageNumber: null,
      kind: 'cover',
      title: coverTitle,
      subtitle: coverSubtitle
    }
  ];
  let physicalIndex = 1;
  let bookPageNumber = 1;

  for (const section of sections) {
    const groupedItems = chunkItems(section.items, ITEMS_PER_PAGE);

    groupedItems.forEach((items, index) => {
      pages.push({
        id: `${section.category.id}-${index + 1}`,
        physicalIndex,
        bookPageNumber,
        kind: 'category',
        category: section.category,
        items,
        showTab: index === 0,
        sectionPageIndex: index + 1,
        sectionPageCount: groupedItems.length
      });

      physicalIndex += 1;
      bookPageNumber += 1;
    });
  }

  pages.push({
    id: 'back',
    physicalIndex,
    bookPageNumber: null,
    kind: 'back',
    quote: backQuote
  });

  return pages;
}
