"use client";
import { useQuery } from "@tanstack/react-query";
import { HomeEventCarousel } from "@/components/lounge/home-event-carousel";
import { publicEventsOptions } from "@/lib/public/query";
import { homepageEvents } from "@/lib/server/content-policy";
import { localizeEvents } from "@/lib/menu/map-menu";
import type { AppLocale } from "@/i18n/config";

export function HomeShows({ locale }: { locale: AppLocale }) {
  const query = useQuery(publicEventsOptions());
  const events = localizeEvents(locale, homepageEvents(query.data ?? []));
  return <HomeEventCarousel events={events} locale={locale} loading={query.data === undefined} error={query.isError} retry={() => void query.refetch()} />;
}
