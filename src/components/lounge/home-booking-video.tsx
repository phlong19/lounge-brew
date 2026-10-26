import { getTranslations } from "next-intl/server";
import { ReservationForm } from "@/components/lounge/reservation-form";
import { shortEventDate } from "@/components/lounge/event-grid";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Grid, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { venueNow } from "@/lib/reservations/validation";
import type { LocalizedEvent } from "@/types/domain";

export async function HomeBookingVideo({ events, locale }: { events: LocalizedEvent[]; locale: AppLocale }) {
  const t = await getTranslations("PreservedHome");
  const choices = events.map(event => ({ id:event.id,label:`${event.performerName} · ${shortEventDate(event.eventDate,locale)}`,date:venueNow(new Date(event.eventDate)).date,time:venueNow(new Date(event.eventDate)).time }));
  return <Section id="booking" data-home-section="booking" aria-label={t("bookingVideoLabel")} className="bg-white">
    <Container><Grid className="items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <ReservationForm today={venueNow().date} events={choices} />
      <Article id="video" data-home-section="video" aria-labelledby="video-heading" className="scroll-mt-8"><Stack gap="lg">
        <Typography as="h2" variant="heading" id="video-heading">{t("videoTitle")}</Typography>
        <Surface tone="evening" className="flex aspect-video items-center justify-center p-6 md:p-10"><Stack gap="lg" className="max-w-lg text-center"><Icon name="music" className="mx-auto size-10" /><Typography as="h3" variant="subheading">{t("videoUnavailable")}</Typography><Typography>{t("videoExplanation")}</Typography></Stack></Surface>
        <Inline gap="sm"><Button asChild><AppLink href={source.video.collectionUrl} target="_blank">{t("allVideos")}<Icon name="arrowUpRight" /></AppLink></Button><AppLink href={source.video.sourceUrl} target="_blank" className="inline-flex min-h-11 items-center gap-3 px-2 text-sm hover:underline">{t("openOriginalVideo")}<Icon name="externalLink" className="size-4" /></AppLink></Inline>
      </Stack></Article>
    </Grid></Container>
  </Section>;
}
