import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ReservationButton } from "@/components/lounge/reservation-provider";
import { Icon } from "@/components/ui/icon";
import {
  Container,
  Grid,
  Inline,
  Main,
  Section,
  Stack,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import type { AppLocale } from "@/i18n/config";
import { localizeEvent } from "@/lib/menu/map-menu";
import { isBookableEvent, isEventEnded } from "@/lib/server/content-policy";
import { getEventById } from "@/lib/server/lounge-data";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { event } = await getEventById(id);
  return { title: event ? event.performer_name : undefined };
}
export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const [locale, t, { event: source }] = await Promise.all([
    getLocale(),
    getTranslations("Shows"),
    getEventById(id),
  ]);
  if (!source) notFound();
  const ended = isEventEnded(source);
  const canBook = isBookableEvent(source);
  const event = localizeEvent(locale as AppLocale, source);
  const date = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "full",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(event.eventDate));
  const timeFormat = new Intl.DateTimeFormat(
    locale === "vi" ? "vi-VN" : "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    },
  );
  return (
    <>
      <SiteHeader active="events" />
      <Main id="main-content">
        <Section>
          <Container>
            <AppLink
              href="/events"
              className="mb-8 inline-flex min-h-11 items-center gap-2 hover:underline"
            >
              <Icon name="arrowLeft" className="size-4" />
              {t("back")}
            </AppLink>
            <Grid className="items-start gap-10 lg:grid-cols-2 lg:gap-20">
              <Surface className="relative aspect-[5/6]">
                {event.coverImageUrl ? (
                  <Media
                    src={event.coverImageUrl}
                    alt={t("poster", { artist: event.performerName })}
                    fill
                    fit="contain"
                    priority
                    sizes="(min-width:1024px) 50vw, 100vw"
                  />
                ) : (
                  <Icon name="music" className="size-20" />
                )}
              </Surface>
              <Stack gap="xl" className="lg:py-6">
                <Typography as="h1" variant="display" tone="brand">
                  {event.performerName}
                </Typography>
                <Stack gap="lg">
                  <Stack gap="sm">
                    <Typography variant="caption" tone="muted">
                      {t("date")}
                    </Typography>
                    <Typography
                      as="time"
                      dateTime={event.eventDate}
                      variant="subheading"
                    >
                      {date}
                    </Typography>
                  </Stack>
                  <Inline gap="lg">
                    <Icon name="clock" />
                    <Typography variant="lead">
                      {timeFormat.format(new Date(event.eventDate))}
                      {event.endDate
                        ? ` — ${timeFormat.format(new Date(event.endDate))}`
                        : ""}
                    </Typography>
                  </Inline>
                  <Inline>
                    <Icon name="mapPin" />
                    <Typography>{venue.address}</Typography>
                  </Inline>
                </Stack>
                {event.description ? (
                  <Typography variant="lead" tone="muted">
                    {event.description}
                  </Typography>
                ) : null}
                <Stack gap="md">
                  {ended ? (
                    <Typography variant="lead" tone="brand">
                      {t("ended")}
                    </Typography>
                  ) : canBook ? (
                    <ReservationButton eventId={event.id} size="lg" className="w-fit">
                      <Icon name="calendar" />{t("book")}
                    </ReservationButton>
                  ) : null}
                  {canBook ? (
                    <Typography variant="small" tone="muted">
                      {t("bookingNote")}
                    </Typography>
                  ) : null}
                </Stack>
                {event.sourceUrl ? (
                  <AppLink
                    href={event.sourceUrl}
                    target="_blank"
                    className="inline-flex min-h-11 w-fit items-center gap-2 text-sm hover:underline"
                  >
                    {t("original")}
                    <Icon name="externalLink" className="size-4" />
                  </AppLink>
                ) : null}
              </Stack>
            </Grid>
          </Container>
        </Section>
      </Main>
      <SiteFooter />
    </>
  );
}
