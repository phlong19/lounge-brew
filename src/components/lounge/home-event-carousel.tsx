"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { EventPosterCard } from "@/components/lounge/event-poster-card";
import { EventTicket } from "@/components/lounge/home-ticket-shows";
import { PublicQueryState } from "@/components/lounge/public-query-state";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Container, Inline, Section, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Reveal } from "@/components/ui/reveal";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { ticketStyles } from "@/lib/ui/ticket-styles";
import { surfaceStyles } from "@/lib/ui/styles";
import type { AppLocale } from "@/i18n/config";
import type { LocalizedEvent } from "@/types/domain";

/** One query, one carousel, two preserved card renderers. Unchecked means tickets. */
export function HomeEventCarousel({ events, locale, loading, error, retry }: {
  events: LocalizedEvent[]; locale: AppLocale; loading: boolean; error: boolean; retry: () => void;
}) {
  const t = useTranslations("PreservedHome"), labels = useTranslations("EventView");
  const shows = useTranslations("Shows");
  const [normal, setNormal] = useState(false);
  const id = useId();
  const heading = <Reveal><Stack gap="sm"><Inline gap="md" className="flex-wrap items-center">
    <Typography as="h2" variant="title" id={`${id}-heading`}>{t("showsTitle")}</Typography>
    <TooltipProvider delayDuration={250}><Tooltip><TooltipTrigger asChild>
      <Switch checked={normal} onCheckedChange={setNormal} aria-label={labels("normalLabel")} aria-describedby={`${id}-help`} aria-controls={`${id}-items`} />
    </TooltipTrigger><TooltipContent id={`${id}-help`}>{labels(normal ? "ticketHint" : "normalHint")}</TooltipContent></Tooltip></TooltipProvider>
  </Inline><Typography variant="lead">{t("showsDescription")}</Typography></Stack></Reveal>;
  return <Section id="shows" data-home-section="shows" data-event-view={normal ? "normal" : "ticket"} aria-labelledby={`${id}-heading`} className={normal ? surfaceStyles.evening : ticketStyles.section}>
    <Container><Stack id={`${id}-items`}>
      {loading || !events.length ? <Stack gap="xl">{heading}{loading ? <PublicQueryState error={error} english={locale === "en"} retry={retry} /> : <Typography variant="lead">{shows("empty")}</Typography>}</Stack> :
        <Carousel label={t("showsTitle")} columns={4} autoplay showCounter={false} indicators indicatorTone="inverse" heading={heading} action={<Reveal delay={1}><Button asChild variant="outline"><AppLink href="/events">{t("allShows")}<Icon name="arrowUpRight" /></AppLink></Button></Reveal>}>
          {events.map((event, index) => <CarouselItem key={event.id} data-source-id={event.id}><Reveal delay={(index % 4) as 0 | 1 | 2 | 3}>{normal ? <EventPosterCard event={event} locale={locale} /> : <EventTicket event={event} locale={locale} />}</Reveal></CarouselItem>)}
        </Carousel>}
    </Stack></Container>
  </Section>;
}
