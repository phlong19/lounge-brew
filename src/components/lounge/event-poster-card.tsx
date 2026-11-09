"use client";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/dates";
import { Icon } from "@/components/ui/icon";
import { Article, Inline, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedEvent } from "@/types/domain";
import { cn } from "@/lib/utils";
import { eventCardStyles } from "@/lib/ui/home-styles";

export function EventPosterCard({ event, locale }: { event: LocalizedEvent; locale: AppLocale }) {
  const shows = useTranslations("Shows");
  return <Article><AppLink href={`/events/${event.id}`} className={cn(eventCardStyles.base, eventCardStyles.dark)}>
          <Surface className="relative aspect-[5/6] overflow-hidden bg-black/20">{event.coverImageUrl ? <Media src={event.coverImageUrl} alt={shows("poster", { artist: event.performerName })} fill fit="contain" className={eventCardStyles.image} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" /> : <Stack className="h-full items-center justify-center"><Icon name="music" className="size-12" /></Stack>}</Surface>
          <Stack gap="sm" className="p-4"><Typography as="h3" variant="subheading" className={eventCardStyles.title}>{event.performerName}</Typography><Typography as="time" dateTime={event.eventDate} variant="small">{formatDate(event.eventDate)} · {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(event.eventDate))}</Typography><Inline gap="xs" className={eventCardStyles.details}><Typography as="span" variant="small">{shows("details")}</Typography><Icon name="arrowUpRight" className={cn("size-4",eventCardStyles.arrow)} /></Inline></Stack>
        </AppLink></Article>;
}
