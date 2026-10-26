import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EventGrid } from "@/components/lounge/event-grid";
import { PhotoGallery } from "@/components/lounge/photo-gallery";
import { SocialSection } from "@/components/lounge/social-section";
import { VisitSection } from "@/components/lounge/visit-section";
import { Button } from "@/components/ui/button";
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
import { localizeEvents } from "@/lib/menu/map-menu";
import { getLoungeData } from "@/lib/server/lounge-data";
import { surfaceStyles } from "@/lib/ui/styles";

export default async function LandingPage() {
  const [t, locale, data] = await Promise.all([
    getTranslations("Site"),
    getLocale(),
    getLoungeData(),
  ]);
  const events = localizeEvents(locale as AppLocale, data.events).slice(0, 4);
  return (
    <>
      <SiteHeader active="home" />
      <Main id="main-content">
        <Section className="py-7 md:py-10 lg:pb-16">
          <Container>
            <Grid className="gap-10 lg:grid-cols-[0.95fr_1.2fr] lg:items-center lg:gap-16">
              <Stack gap="lg" className="py-3 lg:py-10">
                <Typography
                  as="h1"
                  variant="display"
                  tone="brand"
                  className="whitespace-pre-line"
                >
                  {t("heroTitle")}
                </Typography>
                <Typography variant="lead" tone="muted" className="max-w-md">
                  {t("heroDescription")}
                </Typography>
                <Inline gap="sm" className="pt-2">
                  <Button asChild size="lg">
                    <AppLink href={venue.phoneHref}>
                      {t("book")}
                      <Icon name="arrowUpRight" />
                    </AppLink>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <AppLink href="/menu">
                      {t("openMenu")}
                      <Icon name="arrowRight" className="size-4" />
                    </AppLink>
                  </Button>
                </Inline>
              </Stack>
              <Surface className="relative aspect-[4/3] overflow-hidden lg:aspect-[5/6]">
                <Media
                  src="/trixie/stage.jpg"
                  alt={t("heroAlt")}
                  fill
                  priority
                  sizes="(min-width:1024px) 55vw, 100vw"
                  className="object-[58%_center]"
                />
              </Surface>
            </Grid>
          </Container>
        </Section>
        <Section
          id="shows"
          aria-labelledby="shows-heading"
          className="bg-white"
        >
          <Container>
            <Stack gap="xl">
              <Inline className="items-end justify-between" gap="lg">
                <Stack gap="sm">
                  <Typography as="h2" variant="heading" id="shows-heading">
                    {t("upcoming")}
                  </Typography>
                  <Typography tone="muted">{t("showsIntro")}</Typography>
                </Stack>
                <AppLink
                  href="/events"
                  className="inline-flex min-h-11 items-center gap-2 font-medium hover:underline"
                >
                  {t("allShows")}
                  <Icon name="arrowUpRight" className="size-4" />
                </AppLink>
              </Inline>
              <EventGrid events={events} locale={locale as AppLocale} compact />
            </Stack>
          </Container>
        </Section>
        <Section id="venue" aria-labelledby="venue-heading">
          <Container>
            <Grid className="items-center gap-10 lg:grid-cols-2 lg:gap-24">
              <Stack gap="lg">
                <Typography
                  as="h2"
                  variant="title"
                  tone="brand"
                  id="venue-heading"
                  className="whitespace-pre-line"
                >
                  {t("storyTitle")}
                </Typography>
                <Typography variant="lead" tone="muted">
                  {t("storyDescription")}
                </Typography>
                <AppLink
                  href="#contact"
                  className="inline-flex min-h-11 w-fit items-center gap-2 font-medium hover:underline"
                >
                  {t("storyLink")}
                  <Icon name="arrowDown" className="size-4" />
                </AppLink>
              </Stack>
              <Surface className="relative aspect-[4/3] overflow-hidden">
                <Media
                  src="/trixie/venue-1.jpg"
                  alt={t("cafeAlt")}
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                />
              </Surface>
            </Grid>
          </Container>
        </Section>
        <Section
          aria-labelledby="menu-preview-heading"
          className={surfaceStyles.brand}
        >
          <Container>
            <Grid className="items-center gap-10 md:grid-cols-2 lg:gap-24">
              <Surface className="mx-auto w-full max-w-sm overflow-hidden">
                <AppLink href="/menu?page=3" aria-label={t("openMenu")}>
                  <Media
                    src="/menu/page-03.webp"
                    alt={t("menuAlt")}
                    width={1211}
                    height={1683}
                    sizes="(min-width:768px) 35vw, 80vw"
                    fit="contain"
                    className="h-auto w-full"
                  />
                </AppLink>
              </Surface>
              <Stack gap="lg">
                <Typography
                  as="h2"
                  variant="title"
                  id="menu-preview-heading"
                  className="whitespace-pre-line"
                >
                  {t("menuTitle")}
                </Typography>
                <Typography variant="lead" className="max-w-md">
                  {t("menuDescription")}
                </Typography>
                <Typography variant="small">
                  {t("menuPages")} · {t("menuNote")}
                </Typography>
                <Button asChild variant="secondary" size="lg" className="w-fit">
                  <AppLink href="/menu">
                    {t("openMenu")}
                    <Icon name="arrowUpRight" />
                  </AppLink>
                </Button>
              </Stack>
            </Grid>
          </Container>
        </Section>
        <Section aria-labelledby="gallery-heading" className="bg-white">
          <Container>
            <Stack gap="xl">
              <Inline className="items-end justify-between" gap="lg">
                <Typography as="h2" variant="heading" id="gallery-heading">
                  {t("galleryTitle")}
                </Typography>
                <Typography tone="muted" className="max-w-sm">
                  {t("galleryDescription")}
                </Typography>
              </Inline>
              <PhotoGallery />
            </Stack>
          </Container>
        </Section>
        <VisitSection />
        <SocialSection />
      </Main>
      <SiteFooter />
    </>
  );
}
