"use client";
import {PublicQueryState} from "@/components/lounge/public-query-state";
import {useQuery} from "@tanstack/react-query";
import {publicEventsOptions} from "@/lib/public/query";
import {localizeEvents} from "@/lib/menu/map-menu";
import {formatDate} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { eventCardStyles } from "@/lib/ui/home-styles";
import {useTranslations} from "next-intl";

import { Icon } from "@/components/ui/icon";
import { Article, Grid, Inline, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";



export function EventGrid({
  locale,
  compact = false,
}: {
  locale: AppLocale;
  compact?: boolean;
}) {
  const t=useTranslations("Shows");
  const query=useQuery(publicEventsOptions());
  const events=localizeEvents(locale,query.data??[]);
  if(query.data===undefined)return <PublicQueryState error={query.isError} english={locale==="en"} retry={()=>void query.refetch()} />;
  if (!events.length)
    return (
      <Typography className="max-w-xl" tone="muted">
        {t("empty")}
      </Typography>
    );
  return (
    <Grid
      className={
        compact
          ? "grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {events.map((event) => (
        <Article key={event.id} className="group">
          <AppLink
            href={`/events/${event.id}`}
            className={cn(eventCardStyles.base,eventCardStyles.light)}
            aria-label={`${event.performerName} · ${formatDate(event.eventDate)}`}
          >
            <Surface
              className="relative aspect-[5/6] overflow-hidden"
              tone="paper"
            >
              {event.coverImageUrl ? (
                <Media
                  src={event.coverImageUrl}
                  alt={t("poster", { artist: event.performerName })}
                  fill
                  fit="contain"
                  sizes={
                    compact
                      ? "(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  }
                  className={eventCardStyles.image}
                />
              ) : (
                <Stack className="h-full items-center justify-center p-8">
                  <Icon name="music" className="size-12" />
                  <Typography variant="subheading">
                    {event.performerName}
                  </Typography>
                </Stack>
              )}
            </Surface>
          <Stack gap="sm" className="p-4">
            <Inline className="justify-between" gap="sm">
              <Typography
                as="time"
                dateTime={event.eventDate}
                variant="caption"
              >
                {formatDate(event.eventDate)}
              </Typography>
              <Icon name="arrowUpRight" className="size-4" />
            </Inline>
            <Typography as={compact ? "h3" : "h2"} variant="subheading" className={eventCardStyles.title}>
              {event.performerName}
            </Typography>
            <Typography variant="small" tone="muted">
              {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Ho_Chi_Minh",
              }).format(new Date(event.eventDate))}{" "}
              · Trixie Café & Lounge
            </Typography>
          </Stack>
          </AppLink>
        </Article>
      ))}
    </Grid>
  );
}
