import type { EventRow } from "@/types/domain";

export type EditableEvent = EventRow & { additionalFee?: number | null; content_vi?: string; cover_file?: File };
export type EventFilters = { search: string; scope: string; month: string; year: string };
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export function venueDateParts(value: string) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return null;
  return Object.fromEntries(dateFormatter.formatToParts(new Date(value)).map(part => [part.type, part.value]));
}
export function localDateInput(value: string | null | undefined) {
  const parts = venueDateParts(value || "");
  return parts ? `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` : "";
}
export function filterEvents(items: EditableEvent[], filters: EventFilters) {
  const query = filters.search.trim().toLocaleLowerCase("vi");
  return items.filter(item => {
    const date = venueDateParts(item.event_date);
    return (!query || `${item.title_vi} ${item.performer_name}`.toLocaleLowerCase("vi").includes(query))
      && (filters.scope === "visible" ? item.is_active : filters.scope === "hidden" ? !item.is_active : true)
      && (filters.month === "all" || date?.month === filters.month)
      && (filters.year === "all" || date?.year === filters.year);
  }).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
}
export function paginationPages(current: number, total: number): (number | "gap-left" | "gap-right")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const middle = Array.from({ length: total - 2 }, (_, index) => index + 2).filter(page => Math.abs(page - current) <= 1 || (current <= 3 && page <= 4) || (current >= total - 2 && page >= total - 3));
  return [1, ...(middle[0] > 2 ? ["gap-left" as const] : []), ...middle, ...(middle.at(-1)! < total - 1 ? ["gap-right" as const] : []), total];
}
