import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EventGrid } from "@/components/lounge/event-grid";
import { VisitSection } from "@/components/lounge/visit-section";
import { Container, Main, Section, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { localizeEvents } from "@/lib/menu/map-menu";
import { getLoungeData } from "@/lib/server/lounge-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shows");
  return { title: t("title") };
}
export default async function EventsPage() {
  const [locale, t, data] = await Promise.all([
    getLocale(),
    getTranslations("Shows"),
    getLoungeData(),
  ]);
  const events = localizeEvents(locale as AppLocale, data.events);
  return (
    <>
      <SiteHeader active="events" />
      <Main id="main-content">
        <Section>
          <Container>
            <Stack gap="xl">
              <Stack gap="md">
                <Typography as="h1" variant="display" tone="brand">
                  {t("title")}
                </Typography>
                <Typography variant="lead" tone="muted" className="max-w-2xl">
                  {t("description")}
                </Typography>
              </Stack>
              <EventGrid events={events} locale={locale as AppLocale} />
            </Stack>
          </Container>
        </Section>
        <VisitSection />
      </Main>
      <SiteFooter compact />
    </>
  );
}
