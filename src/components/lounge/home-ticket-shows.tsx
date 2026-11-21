"use client";
import type { ReactNode } from "react";
import { TicketPaper } from "@/components/ui/ticket-paper";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { Article, Inline, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { scriptHeadingFont, ticketPrintFont } from "@/lib/fonts";
import { formatDate } from "@/lib/dates";
import { ticketPalette } from "@/lib/ui/ticket-palettes";
import { ticketStyles as s } from "@/lib/ui/ticket-styles";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedEvent } from "@/types/domain";

function TicketFrame({preview,event,children,className,label}:{preview:boolean;event:LocalizedEvent;children:ReactNode;className:string;label:string}) {
 return <TicketPaper color={event.ticketPaletteKey}>{preview ? <Surface className={className} aria-label="Xem trước vé sự kiện">{children}</Surface> : <AppLink href={`/events/${event.id}`} data-ticket-palette={event.ticketPaletteKey??"charcoal"} className={className} aria-label={label}>{children}</AppLink>}</TicketPaper>;
}
export function EventTicket({ event, locale, preview=false }: { event: LocalizedEvent; locale: AppLocale; preview?:boolean }) {
  const t = useTranslations("TicketShows"), shows = useTranslations("Shows");
  const palette = ticketPalette(event.ticketPaletteKey) ?? ticketPalette("charcoal")!;
  const validDate=Number.isFinite(Date.parse(event.eventDate));
  const date=validDate?formatDate(event.eventDate):"--/--/----";
  const time = validDate ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(event.eventDate)) : "--:--";
  return <Article className="px-1 pt-2 pb-3"><TicketFrame preview={preview} event={event} className={cn(s.link, ticketPrintFont.className, palette.stock)} label={`${event.performerName} · ${date} · ${t("details")}`}>
    <Surface aria-hidden="true" className={s.shineFrame}><Surface className={s.shine} /></Surface>
    <Surface aria-hidden="true" className={s.crown}><Surface className={s.crownRule} /><Icon name="star" className={cn(s.star,"size-2.5 -rotate-12")} /><Icon name="star" className={cn(s.star,"size-3.5 rotate-6")} /><Surface className={cn(s.crownRule,"flex-[2]")} /></Surface>
    <Surface className={s.header}>
      <Icon name="star" aria-hidden="true" className={cn(s.mark, "top-16 left-3 size-2.5 -rotate-12 fill-current opacity-35")} />
      <Icon name="star" aria-hidden="true" className={cn(s.mark, "top-11 right-4 size-2 rotate-12 fill-current opacity-50")} />
      <Typography variant="caption" className={s.series}>{t("series")} · TRIXIE</Typography>
      <Typography as="h3" variant="subheading" className={cn(s.artist, scriptHeadingFont.className)}>{event.performerName.toLocaleLowerCase(locale)}</Typography>
      <Surface className={s.dateRow}>
        <Stack gap="none"><Typography variant="caption" className={s.label}>{t("date")}</Typography><Typography as="time" dateTime={event.eventDate} className={s.value}>{date}</Typography></Stack>
        <Surface aria-hidden="true" className={s.separator} />
        <Stack gap="none"><Typography variant="caption" className={s.label}>{t("time")}</Typography><Typography className={s.value}>{time}</Typography></Stack>
      </Surface>
    </Surface>
    <Surface aria-hidden="true" className="relative"><Surface className={cn(s.notch,"-left-3")} /><Surface className={s.perforation} /><Surface className={cn(s.notch,"-right-3")} /></Surface>
    <Surface className={s.poster}>{event.coverImageUrl ? <Media src={event.coverImageUrl} alt={shows("poster", { artist: event.performerName })} fill fit="cover" className={s.image} sizes="(min-width:1024px) 22vw, (min-width:640px) 42vw, 75vw" /> : <Stack className="h-full items-center justify-center"><Icon name="music" className="size-12" /></Stack>}</Surface>
    <Typography variant="caption" className={s.venue}>{t("venue")}</Typography>
    <Surface aria-hidden="true" className={s.perforation} />
    <Surface className={s.stub}><Icon name="star" aria-hidden="true" className={cn(s.mark, "top-1 right-16 size-2.5 -rotate-12 fill-current opacity-40")} /><Inline className="justify-between gap-2"><Typography as="span" className={s.action}>{t("details")}</Typography><Surface className={s.arrow}><Icon name="arrowUpRight" className="size-4" /></Surface></Inline></Surface>
  <Surface aria-hidden="true" className={s.bottomDots} /><Surface aria-hidden="true" className={s.bottomEdge} />
  </TicketFrame></Article>;
}
