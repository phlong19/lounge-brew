import { verifiedArticles, verifiedEvents } from "@/data/trixie-content";
import {
  isPublicEvent,
  publishedArticles,
  resolveDataset,
  upcomingEvents,
} from "@/lib/server/content-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ArticleRow,
  CategoryRow,
  EventRow,
  HomePageData,
  MenuItemRow,
} from "@/types/domain";

type ContentSource = "snapshot" | "supabase" | "mixed";

export type LoungeDataResult = HomePageData & {
  /** Retained for callers; the verified snapshot is not invented mock content. */
  usingMockData: boolean;
  contentSource: ContentSource;
};

function snapshot(now: Date): LoungeDataResult {
  return {
    // The original menu artwork is authoritative; never substitute old mock prices.
    categories: [],
    menuItems: [],
    events: upcomingEvents(verifiedEvents, now),
    articles: publishedArticles(verifiedArticles, now),
    usingMockData: false,
    contentSource: "snapshot",
  };
}

async function getContentClient() {
  try {
    return await createSupabaseServerClient();
  } catch {
    console.warn(
      "Trixie content connection unavailable; using the verified snapshot.",
    );
    return null;
  }
}

export async function getLoungeData(): Promise<LoungeDataResult> {
  const now = new Date();
  const fallback = snapshot(now);
  const supabase = await getContentClient();
  if (!supabase) return fallback;

  const [categories, menuItems, events, articles] = await Promise.all([
    resolveDataset<CategoryRow[] | null>(
      () =>
        supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true })
          .abortSignal(AbortSignal.timeout(5000)),
      [],
    ),
    resolveDataset<MenuItemRow[] | null>(
      () =>
        supabase
          .from("menu_items")
          .select("*")
          .order("sort_order", { ascending: true })
          .abortSignal(AbortSignal.timeout(5000)),
      [],
    ),
    resolveDataset<EventRow[] | null>(
      () =>
        supabase
          .from("events")
          .select("*")
          .eq("is_active", true)
          .order("event_date", { ascending: true })
          .abortSignal(AbortSignal.timeout(5000)),
      fallback.events,
    ),
    resolveDataset<ArticleRow[] | null>(
      () =>
        supabase
          .from("articles")
          .select("*")
          .not("published_at", "is", null)
          .lte("published_at", now.toISOString())
          .order("published_at", { ascending: false })
          .abortSignal(AbortSignal.timeout(5000)),
      fallback.articles,
    ),
  ]);

  const sources = [categories, menuItems, events, articles].map(
    (result) => result.source,
  );
  if (sources.includes("snapshot")) {
    console.warn(
      "Some Trixie content is unavailable; using its verified snapshot.",
    );
  }
  return {
    categories: categories.data ?? [],
    menuItems: menuItems.data ?? [],
    events: upcomingEvents(events.data ?? [], now),
    articles: publishedArticles(articles.data ?? [], now),
    usingMockData: false,
    contentSource: sources.every((source) => source === "supabase")
      ? "supabase"
      : sources.every((source) => source === "snapshot")
        ? "snapshot"
        : "mixed",
  };
}

export async function getArticleBySlug(slug: string): Promise<{
  article: ArticleRow | null;
  usingMockData: boolean;
  contentSource: ContentSource;
}> {
  const now = new Date();
  const fallback =
    publishedArticles(verifiedArticles, now).find(
      (article) => article.slug === slug,
    ) ?? null;
  const supabase = await getContentClient();
  if (!supabase)
    return {
      article: fallback,
      usingMockData: false,
      contentSource: "snapshot",
    };

  const result = await resolveDataset<ArticleRow | null>(
    () =>
      supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .not("published_at", "is", null)
        .lte("published_at", now.toISOString())
        .abortSignal(AbortSignal.timeout(5000))
        .maybeSingle(),
    fallback,
  );
  if (result.source === "snapshot") {
    console.warn(
      "Trixie article content unavailable; using the verified snapshot.",
    );
  }
  return {
    article: result.data
      ? (publishedArticles([result.data], now)[0] ?? null)
      : null,
    usingMockData: false,
    contentSource: result.source,
  };
}

/** A show's URL remains useful after it leaves the upcoming schedule. */
export async function getEventById(id: string): Promise<{
  event: EventRow | null;
  usingMockData: boolean;
  contentSource: ContentSource;
}> {
  const fallback =
    verifiedEvents.find((event) => event.id === id && isPublicEvent(event)) ??
    null;
  const supabase = await getContentClient();
  if (!supabase) {
    return { event: fallback, usingMockData: false, contentSource: "snapshot" };
  }

  const result = await resolveDataset<EventRow | null>(
    () =>
      supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .abortSignal(AbortSignal.timeout(5000))
        .maybeSingle(),
    fallback,
  );
  if (result.source === "snapshot") {
    console.warn(
      "Trixie show content unavailable; using the verified snapshot.",
    );
  }
  return {
    event: result.data && isPublicEvent(result.data) ? result.data : null,
    usingMockData: false,
    contentSource: result.source,
  };
}
