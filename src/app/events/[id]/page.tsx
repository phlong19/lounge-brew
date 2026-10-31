import {Great_Vibes} from "next/font/google";
import {eventHeadingTitle} from "@/lib/events/title";
import {eventStyles} from "@/lib/ui/event-styles";
import {cn} from "@/lib/utils";
import {PublicDataBoundary} from "@/components/lounge/public-data-boundary";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { RichText } from "@/components/content/rich-text";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ReservationButton } from "@/components/lounge/reservation-provider";
import { EventCalendar } from "@/components/ui/event-calendar";
import { eventBody } from "@/lib/content/event-body";
import { Icon } from "@/components/ui/icon";
import {
  Container,
  Grid,
  Inline,
  Main,
  Section,
  Stack,
} from "@/components/ui/layout";
import { EventSidebar } from "@/components/lounge/event-sidebar";
import {PublicSeating} from "@/components/lounge/public-seating";
import {getPublicEvents} from "@/lib/server/event-extras";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import type { AppLocale } from "@/i18n/config";
import { localizeEvent } from "@/lib/menu/map-menu";
import { isBookableEvent, isEventEnded } from "@/lib/server/content-policy";
import { getEventById } from "@/lib/server/lounge-data";

const headingFont=Great_Vibes({subsets:["latin","vietnamese"],weight:"400",display:"swap"});

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { event } = await getEventById(id);
  return { title: event ? event.title_vi : undefined };
}
export default async function ShowPage({ params }: Props) {
  const { id } = await params;
  const [locale, t, { event: source }] = await Promise.all([
    getLocale(),
    getTranslations("Shows"),
    getEventById(id),
  ]);
  if (!source) notFound();
  const others=await getPublicEvents().then(rows=>rows.filter(row=>(row.public_id||row.id)!==id)).catch(()=>[]);
  const ended = isEventEnded(source);
  const canBook = isBookableEvent(source);
  const event = localizeEvent(locale as AppLocale, source);
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
    <PublicDataBoundary seating>
      <SiteHeader active="events" />
      <Main id="main-content">
        <Section>
          <Container className="max-w-[1440px]">
            <Grid className="items-start gap-8 border-b border-stone-200 pb-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12" data-event-header>
              <EventCalendar date={event.eventDate} english={locale === "en"} className="order-2 w-full max-w-sm lg:order-1" />
              <Stack gap="lg" className="order-1 min-w-0 lg:order-2">
                <Typography as="h1" variant="title" tone="ink" className={cn(headingFont.className,eventStyles.detailHeading)}>
                  {eventHeadingTitle(event.title,locale as AppLocale)}
                </Typography>
                <Stack gap="lg" className="col-span-2">
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
                {source.additional_fee != null ? <Typography className="col-span-2">{locale === "vi" ? "Phụ thu: " : "Additional fee: "}{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-GB",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(source.additional_fee)}</Typography> : null}
                <Stack gap="md" className="col-span-2">
                  {ended ? (
                    <Typography variant="lead" tone="brand">
                      {t("ended")}
                    </Typography>
                  ) : canBook ? (
                    <ReservationButton eventId={event.id} size="lg" className="w-fit">
                      <Icon name="calendar" />{t("book")}
                    </ReservationButton>
                  ) : null}
                </Stack>
              </Stack>
            </Grid>
            <Grid className={others.length ? "mt-10 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8" : "mt-10"}>
              <Stack gap="xl" className="w-full">
                {event.content ? <Stack data-event-article><RichText content={eventBody(event.content)} imageSize="event" /></Stack> : event.description ? <Typography variant="lead">{event.description}</Typography> : null}
                <PublicSeating english={locale === "en"} />
              </Stack>
              <EventSidebar currentId={id} locale={locale as AppLocale} />
            </Grid>
          </Container>
        </Section>
      </Main>
      <SiteFooter />
    </PublicDataBoundary>
  );
}
