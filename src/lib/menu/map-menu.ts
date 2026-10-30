import type { AppLocale } from "@/i18n/config";
import { publishedArticles, upcomingEvents } from "@/lib/server/content-policy";
import type {
  ArticleRow,
  EventRow,
  LocalizedArticle,
  LocalizedEvent,
} from "@/types/domain";

type LocalizedString = {
  value: string;
  fallbackFromVietnamese: boolean;
};

function localizeText(
  locale: AppLocale,
  vietnamese?: string | null,
  english?: string | null,
): LocalizedString {
  const vietnameseValue = vietnamese?.trim() ?? "";
  const englishValue = english?.trim() ?? "";

  if (locale === "en") {
    if (englishValue) {
      return { value: englishValue, fallbackFromVietnamese: false };
    }

    return {
      value: vietnameseValue,
      fallbackFromVietnamese: Boolean(vietnameseValue),
    };
  }

  if (vietnameseValue) {
    return { value: vietnameseValue, fallbackFromVietnamese: false };
  }

  return { value: englishValue, fallbackFromVietnamese: false };
}

export function localizeEvent(
  locale: AppLocale,
  event: EventRow,
): LocalizedEvent {
  const localizedTitle = localizeText(locale, event.title_vi, event.title_en);
  const localizedDescription = localizeText(
    locale,
    event.description_vi,
    event.description_en,
  );

  return {
    id: event.public_id || event.id,
    content: localizeText(locale,event.content_vi,event.content_en).value || null,
    title: localizedTitle.value,
    performerName: event.performer_name,
    eventDate: event.event_date,
    endDate: event.end_date ?? null,
    sourceUrl: event.source_url ?? null,
    description: localizedDescription.value || null,
    coverImageUrl: event.cover_image_url,
    fallbackFromVietnamese:
      localizedTitle.fallbackFromVietnamese ||
      localizedDescription.fallbackFromVietnamese,
  };
}

export function localizeArticle(
  locale: AppLocale,
  article: ArticleRow,
): LocalizedArticle {
  const localizedTitle = localizeText(
    locale,
    article.title_vi,
    article.title_en,
  );
  const localizedContent = localizeText(
    locale,
    article.content_vi,
    article.content_en,
  );

  return {
    id: article.id,
    title: localizedTitle.value,
    slug: article.slug,
    content: localizedContent.value,
    thumbnailUrl: article.thumbnail_url,
    publishedAt: article.published_at,
    fallbackFromVietnamese:
      localizedTitle.fallbackFromVietnamese ||
      localizedContent.fallbackFromVietnamese,
  };
}

export function localizeEvents(
  locale: AppLocale,
  events: EventRow[],
  now: Date = new Date(),
) {
  return upcomingEvents(events, now).map((event) =>
    localizeEvent(locale, event),
  );
}

export function localizeArticles(
  locale: AppLocale,
  articles: ArticleRow[],
  now: Date = new Date(),
) {
  return publishedArticles(articles, now).map((article) =>
    localizeArticle(locale, article),
  );
}
