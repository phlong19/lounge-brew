import { getLocale } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroCarousel } from "@/components/lounge/hero-carousel";
import { HomeIntroduction } from "@/components/lounge/home-introduction";
import { HomeFood } from "@/components/lounge/home-food";
import { HomeShows } from "@/components/lounge/home-shows";
import { HomeArchive } from "@/components/lounge/home-archive";
import { HomeVideo } from "@/components/lounge/home-video";
import { Main } from "@/components/ui/layout";
import type { AppLocale } from "@/i18n/config";
import { localizeEvents } from "@/lib/menu/map-menu";
import { homepageEvents } from "@/lib/server/content-policy";
import { getLoungeData } from "@/lib/server/lounge-data";

export default async function LandingPage() {
  const [locale, data] = await Promise.all([getLocale(), getLoungeData()]);
  const events = localizeEvents(locale as AppLocale, homepageEvents(data.events));
  return (
    <>
      <SiteHeader active="home" />
      <Main id="main-content">
        <HeroCarousel />
        <HomeShows events={events} locale={locale as AppLocale} />
        <HomeIntroduction locale={locale as AppLocale} />
        <HomeFood locale={locale as AppLocale} />
        <HomeVideo />
        <HomeArchive locale={locale as AppLocale} />
      </Main>
      <SiteFooter />
    </>
  );
}
