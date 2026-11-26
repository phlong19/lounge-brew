import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { EventShowcase } from "@/components/lounge/event-showcase";
import { PublicDataBoundary } from "@/components/lounge/public-data-boundary";
import { Main } from "@/components/ui/layout";
import type { AppLocale } from "@/i18n/config";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TestPage() {
  const [locale, shows] = await Promise.all([getLocale(), getTranslations("Shows")]);

  return (
    <PublicDataBoundary>
      <SiteHeader active="events" compact />
      <Main id="main-content" className="min-h-0">
        <EventShowcase locale={locale as AppLocale} title={shows("title")} />
      </Main>
      <SiteFooter />
    </PublicDataBoundary>
  );
}
