import type { ArticleRow, EventRow } from "@/types/domain";

export type ContentSource = "supabase" | "snapshot";

/** Resolve each dataset independently; a successful empty response is authoritative. */
export async function resolveDataset<T>(
  load: () => PromiseLike<{ data: T; error: unknown }>,
  fallback: T,
): Promise<{ data: T; source: ContentSource }> {
  try {
    const result = await load();
    if (!result.error) return { data: result.data, source: "supabase" };
  } catch {
    // Transport errors are treated like query errors, without retaining sensitive details.
  }
  return { data: fallback, source: "snapshot" };
}

/** Public detail pages may retain an ended show, but never an inactive or invalid record. */
export function isPublicEvent(event: EventRow): boolean {
  const start = Date.parse(event.event_date);
  const end = Date.parse(event.end_date ?? event.event_date);
  return (
    event.is_active === true &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end >= start
  );
}

export function isEventEnded(
  event: Pick<EventRow, "event_date" | "end_date">,
  now: Date = new Date(),
): boolean {
  const end = Date.parse(event.end_date ?? event.event_date);
  return !Number.isFinite(end) || end <= now.getTime();
}

/** Include a performance while its verified end time has not passed. */
export function upcomingEvents(
  events: EventRow[],
  now: Date = new Date(),
): EventRow[] {
  return events
    .filter((event) => isPublicEvent(event) && !isEventEnded(event, now))
    .sort(
      (left, right) =>
        Date.parse(left.event_date) - Date.parse(right.event_date),
    );
}

/** Automatic booking eligibility: visible and strictly before its start time. */
export function isBookableEvent(event: EventRow, now: Date = new Date()): boolean {
  return isPublicEvent(event) && Date.parse(event.event_date) > now.getTime();
}
export function bookableEvents(events: EventRow[], now: Date = new Date()): EventRow[] {
  return events.filter(event => isBookableEvent(event, now)).sort((left, right) => Date.parse(left.event_date) - Date.parse(right.event_date));
}
/** Four nearest future shows, earliest date first. */
export function homepageEvents(events: EventRow[], now: Date = new Date()): EventRow[] {
  return bookableEvents(events, now).slice(0, 4);
}

export function publishedArticles(
  articles: ArticleRow[],
  now: Date = new Date(),
): ArticleRow[] {
  return articles
    .filter((article) => {
      const published = Date.parse(article.published_at ?? "");
      return Number.isFinite(published) && published <= now.getTime();
    })
    .sort(
      (left, right) =>
        Date.parse(right.published_at!) - Date.parse(left.published_at!),
    );
}
