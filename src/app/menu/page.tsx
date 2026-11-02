import { scriptHeadingFont as headingFont } from "@/lib/fonts";
import { eventStyles } from "@/lib/ui/event-styles";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FlipbookMenu } from "@/components/lounge/flipbook-menu";
import { Container, Main, Section, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { buildImageMenuPages } from "@/lib/menu/build-menu-pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Menu");
  return { title: t("title") };
}
export default async function MenuPage() {
  const [t, locale] = await Promise.all([getTranslations("Menu"), getLocale()]);
  return (
    <>
      <SiteHeader active="menu" />
      <Main id="main-content" className="min-h-0">
        <Section className="py-6 md:py-8">
          <Container>
            <Stack gap="sm">
              <Typography
                as="h1"
                variant="title"
                tone="ink"
                className={cn(headingFont.className, eventStyles.detailHeading)}
              >
                {t("title")}
              </Typography>
            </Stack>
          </Container>
        </Section>
        <Container className="max-w-[1440px] pb-16">
          <FlipbookMenu pages={buildImageMenuPages(locale as AppLocale)} />
        </Container>
      </Main>
      <SiteFooter />
    </>
  );
}
