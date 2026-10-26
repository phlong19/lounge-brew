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
      <Main id="main-content">
        <Section className="pb-6 md:pb-8">
          <Container>
            <Stack gap="sm">
              <Typography as="h1" variant="title" tone="brand">
                {t("title")}
              </Typography>
              <Typography tone="muted" className="max-w-2xl">
                {t("description")}
              </Typography>
            </Stack>
          </Container>
        </Section>
        <Container className="pb-16">
          <FlipbookMenu pages={buildImageMenuPages(locale as AppLocale)} />
          <Typography
            variant="small"
            tone="muted"
            className="mx-auto mt-8 max-w-3xl text-center"
          >
            {t("artworkNote")}
          </Typography>
        </Container>
      </Main>
      <SiteFooter />
    </>
  );
}
