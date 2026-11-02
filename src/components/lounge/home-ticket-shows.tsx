"use client";

import { useTranslations } from "next-intl";
import { PublicQueryState } from "@/components/lounge/public-query-state";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { scriptHeadingFont, ticketPrintFont } from "@/lib/fonts";
import { formatDate } from "@/lib/dates";
import { posterTicketColours, ticketColours, ticketStyles as s } from "@/lib/ui/ticket-styles";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedEvent } from "@/types/domain";

export function EventTicket({ event, locale, colour }: { event: LocalizedEvent; locale: AppLocale; colour: number }) {
  const t = useTranslations("TicketShows"), shows = useTranslations("Shows");
  const palette = posterTicketColours[event.id] ?? { stock: ticketColours[colour % ticketColours.length], stripe: "bg-[#2E7017]" };
  const time = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(event.eventDate));
  return <Article className="px-1 pt-2 pb-3"><AppLink href={`/events/${event.id}`} className={cn(s.link, ticketPrintFont.className, palette.stock)} aria-label={`${event.performerName} · ${formatDate(event.eventDate)} · ${t("details")}`}>
    <Surface aria-hidden="true" className={cn(s.stripe, palette.stripe)} />
    <Surface className={s.header}>
      <Icon name="plus" aria-hidden="true" className={cn(s.mark, "left-3")} />
      <Typography variant="caption" className={s.series}>{t("series")} · TRIXIE</Typography>
      <Typography as="h3" variant="subheading" className={cn(s.artist, scriptHeadingFont.className)}>{event.performerName.toLocaleLowerCase(locale)}</Typography>
      <Surface className={s.dateRow}>
        <Stack gap="none"><Typography variant="caption" className={s.label}>{t("date")}</Typography><Typography as="time" dateTime={event.eventDate} className={s.value}>{formatDate(event.eventDate)}</Typography></Stack>
        <Surface aria-hidden="true" className={s.separator} />
        <Stack gap="none"><Typography variant="caption" className={s.label}>{t("time")}</Typography><Typography className={s.value}>{time}</Typography></Stack>
      </Surface>
    </Surface>
    <Surface aria-hidden="true" className="relative"><Surface className={cn(s.notch,"-left-3")} /><Surface className={s.perforation} /><Surface className={cn(s.notch,"-right-3")} /></Surface>
    <Surface className={s.poster}>{event.coverImageUrl ? <Media src={event.coverImageUrl} alt={shows("poster", { artist: event.performerName })} fill fit="cover" className={s.image} sizes="(min-width:1024px) 22vw, (min-width:640px) 42vw, 75vw" /> : <Stack className="h-full items-center justify-center"><Icon name="music" className="size-12" /></Stack>}</Surface>
    <Typography variant="caption" className={s.venue}>{t("venue")}</Typography>
    <Surface aria-hidden="true" className={s.perforation} />
    <Surface className={s.stub}><Icon name="plus" aria-hidden="true" className={cn(s.mark, "top-1 right-16 size-2.5 rotate-12 opacity-40")} /><Inline className="justify-between gap-2"><Typography as="span" className={s.action}>{t("details")}</Typography><Surface className={s.arrow}><Icon name="arrowUpRight" className="size-4" /></Surface></Inline></Surface>
  </AppLink></Article>;
}

/** Comparison section shares HomeShows' query result; no additional data observer. */
export function HomeTicketShows({ events, locale, loading, error, retry }: { events: LocalizedEvent[]; locale: AppLocale; loading: boolean; error: boolean; retry: () => void }) {
  const t = useTranslations("TicketShows");
  return <Section id="ticket-shows" data-home-section="ticket-shows" aria-labelledby="ticket-shows-heading" className={s.section}><Container>
    {loading ? <PublicQueryState error={error} english={locale === "en"} retry={retry} /> : <Carousel label={t("title")} columns={4} autoplay showCounter={false} indicators indicatorTone="inverse" heading={<Stack gap="sm"><Typography variant="caption" className="font-mono text-xs tracking-[0.2em] text-[#C5D6B9]">{t("eyebrow")}</Typography><Typography as="h2" variant="title" id="ticket-shows-heading">{t("title")}</Typography><Typography variant="lead" className="max-w-2xl">{events.length ? t("description") : t("empty")}</Typography></Stack>} action={<Button asChild variant="outline"><AppLink href="/events">{t("all")}<Icon name="arrowUpRight" /></AppLink></Button>}>
      {events.map((event, index) => <CarouselItem key={event.id}><EventTicket event={event} locale={locale} colour={index} /></CarouselItem>)}
    </Carousel>}
  </Container></Section>;
}
