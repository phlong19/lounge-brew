import { getTranslations } from "next-intl/server";

import { Icon } from "@/components/ui/icon";
import { Article, Grid, Inline, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedEvent } from "@/types/domain";

export function shortEventDate(value: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export async function EventGrid({
  events,
  locale,
  compact = false,
}: {
  events: LocalizedEvent[];
  locale: AppLocale;
  compact?: boolean;
}) {
  const t = await getTranslations("Shows");
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
            className="block overflow-hidden"
            aria-label={`${event.performerName} · ${shortEventDate(event.eventDate, locale)}`}
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
                  className="transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
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
          </AppLink>
          <Stack gap="sm" className="pt-5">
            <Inline className="justify-between" gap="sm">
              <Typography
                as="time"
                dateTime={event.eventDate}
                variant="caption"
              >
                {shortEventDate(event.eventDate, locale)}
              </Typography>
              <Icon name="arrowUpRight" className="size-4" />
            </Inline>
            <Typography as={compact ? "h3" : "h2"} variant="subheading">
              <AppLink href={`/events/${event.id}`} className="hover:underline">
                {event.performerName}
              </AppLink>
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
        </Article>
      ))}
    </Grid>
  );
}
