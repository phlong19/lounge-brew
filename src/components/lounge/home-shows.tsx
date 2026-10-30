import { getTranslations } from "next-intl/server";
import { shortEventDate } from "@/components/lounge/event-grid";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { eventCardStyles } from "@/lib/ui/home-styles";
import { surfaceStyles } from "@/lib/ui/styles";
import type { LocalizedEvent } from "@/types/domain";

export async function HomeShows({ events, locale }: { events: LocalizedEvent[]; locale: AppLocale }) {
  const [t, shows] = await Promise.all([getTranslations("PreservedHome"), getTranslations("Shows")]);
  return <Section id="shows" data-home-section="shows" aria-labelledby="shows-heading" className={surfaceStyles.evening}>
    <Container><Stack gap="xl">

      {events.length ? <Carousel label={t("showsTitle")} columns={4} autoplay showCounter={false} heading={<Reveal><Stack gap="sm"><Typography as="h2" variant="title" id="shows-heading">{t("showsTitle")}</Typography><Typography variant="lead">{t("showsDescription")}</Typography></Stack></Reveal>} action={<AppLink href="/events" className="inline-flex min-h-11 items-center gap-3 font-medium hover:underline">{t("allShows")}<Icon name="arrowUpRight" /></AppLink>}>
        {events.map(event => <CarouselItem key={event.id} data-source-id={event.id}><Article><AppLink href={`/events/${event.id}`} className={cn(eventCardStyles.base, eventCardStyles.dark)}>
          <Surface className="relative aspect-[5/6] overflow-hidden bg-black/20">{event.coverImageUrl ? <Media src={event.coverImageUrl} alt={shows("poster", { artist: event.performerName })} fill fit="contain" className={eventCardStyles.image} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" /> : <Stack className="h-full items-center justify-center"><Icon name="music" className="size-12" /></Stack>}</Surface>
          <Stack gap="sm" className="p-4"><Typography as="h3" variant="subheading" className={eventCardStyles.title}>{event.performerName}</Typography><Typography as="time" dateTime={event.eventDate} variant="small">{shortEventDate(event.eventDate, locale)} · {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(event.eventDate))}</Typography><Inline gap="xs" className={eventCardStyles.details}><Typography as="span" variant="small">{shows("details")}</Typography><Icon name="arrowUpRight" className={cn("size-4",eventCardStyles.arrow)} /></Inline></Stack>
        </AppLink></Article></CarouselItem>)}
      </Carousel> : <Stack><Typography as="h2" variant="title" id="shows-heading">{t("showsTitle")}</Typography><Typography variant="lead">{shows("empty")}</Typography></Stack>}
    </Stack></Container>
  </Section>;
}
