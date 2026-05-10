import type {AppLocale} from '@/i18n/config';
import type {
  ArticleRow,
  EventRow,
  LocalizedArticle,
  LocalizedEvent,
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

