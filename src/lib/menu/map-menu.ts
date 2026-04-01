import type {AppLocale} from '@/i18n/config';
import type {
  ArticleRow,
  CategoryRow,
  EventRow,
  LocalizedArticle,
  LocalizedCategory,
  LocalizedEvent,
  LocalizedMenuItem,
  MenuItemRow,
  MenuSection
} from '@/types/domain';

type LocalizedString = {
  value: string;
  fallbackFromVietnamese: boolean;
};

function localizeText(locale: AppLocale, vietnamese?: string | null, english?: string | null): LocalizedString {
  const vietnameseValue = vietnamese?.trim() ?? '';
  const englishValue = english?.trim() ?? '';

  if (locale === 'en') {
    if (englishValue) {
      return {value: englishValue, fallbackFromVietnamese: false};
    }

    return {value: vietnameseValue, fallbackFromVietnamese: Boolean(vietnameseValue)};
  }

  if (vietnameseValue) {
    return {value: vietnameseValue, fallbackFromVietnamese: false};
  }

  return {value: englishValue, fallbackFromVietnamese: false};
}

export function localizeCategory(locale: AppLocale, category: CategoryRow): LocalizedCategory {
  const localizedName = localizeText(locale, category.name_vi, category.name_en);
  const localizedTabLabel = localizeText(locale, category.tab_label_vi, category.tab_label_en);

  return {
    id: category.id,
    name: localizedName.value,
    tabLabel: localizedTabLabel.value,
    tabColor: category.tab_color ?? '#8c6142',
    sortOrder: category.sort_order,
    fallbackFromVietnamese:
      localizedName.fallbackFromVietnamese || localizedTabLabel.fallbackFromVietnamese
  };
}

export function localizeMenuItem(locale: AppLocale, item: MenuItemRow): LocalizedMenuItem {
  const localizedName = localizeText(locale, item.name_vi, item.name_en);
  const localizedDescription = localizeText(locale, item.description_vi, item.description_en);

  return {
    id: item.id,
    categoryId: item.category_id,
    name: localizedName.value,
    description: localizedDescription.value || null,
    price: item.price,
    isSoldOut: item.is_sold_out,
    sortOrder: item.sort_order,
    fallbackFromVietnamese:
      localizedName.fallbackFromVietnamese || localizedDescription.fallbackFromVietnamese
  };
}

export function localizeEvent(locale: AppLocale, event: EventRow): LocalizedEvent {
  const localizedTitle = localizeText(locale, event.title_vi, event.title_en);
  const localizedDescription = localizeText(locale, event.description_vi, event.description_en);

  return {
    id: event.id,
    title: localizedTitle.value,
    performerName: event.performer_name,
    eventDate: event.event_date,
    description: localizedDescription.value || null,
    coverImageUrl: event.cover_image_url,
    fallbackFromVietnamese:
      localizedTitle.fallbackFromVietnamese || localizedDescription.fallbackFromVietnamese
  };
}

export function localizeArticle(locale: AppLocale, article: ArticleRow): LocalizedArticle {
  const localizedTitle = localizeText(locale, article.title_vi, article.title_en);
  const localizedContent = localizeText(locale, article.content_vi, article.content_en);

  return {
    id: article.id,
    title: localizedTitle.value,
    slug: article.slug,
    content: localizedContent.value,
    thumbnailUrl: article.thumbnail_url,
    publishedAt: article.published_at,
    fallbackFromVietnamese:
      localizedTitle.fallbackFromVietnamese || localizedContent.fallbackFromVietnamese
  };
}

export function buildMenuSections(
  locale: AppLocale,
  categories: CategoryRow[],
  menuItems: MenuItemRow[]
): MenuSection[] {
  return [...categories]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((category) => {
      const items = menuItems
        .filter((item) => item.category_id === category.id)
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((item) => localizeMenuItem(locale, item));

      if (items.length === 0) {
        return null;
      }

      return {
        category: localizeCategory(locale, category),
        items
      };
    })
    .filter((section): section is MenuSection => Boolean(section));
}

export function localizeEvents(locale: AppLocale, events: EventRow[]) {
  return [...events]
    .filter((event) => event.is_active)
    .sort((left, right) => new Date(left.event_date).getTime() - new Date(right.event_date).getTime())
    .map((event) => localizeEvent(locale, event));
}

export function localizeArticles(locale: AppLocale, articles: ArticleRow[]) {
  return [...articles]
    .filter((article) => Boolean(article.published_at))
    .sort(
      (left, right) =>
        new Date(right.published_at ?? '').getTime() - new Date(left.published_at ?? '').getTime()
    )
    .map((article) => localizeArticle(locale, article));
}
