import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import {
  Article,
  Container,
  Grid,
  Main,
  Section,
  Stack,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { localizeArticles } from "@/lib/menu/map-menu";
import { getLoungeData } from "@/lib/server/lounge-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Stories");
  return { title: t("title") };
}
export default async function JournalPage() {
  const [t, locale, data] = await Promise.all([
    getTranslations("Stories"),
    getLocale(),
    getLoungeData(),
  ]);
  const articles = localizeArticles(locale as AppLocale, data.articles);
  return (
    <>
      <SiteHeader active="journal" />
      <Main id="main-content">
        <Section>
          <Container>
            <Stack gap="xl">
              <Stack>
                <Typography as="h1" variant="display" tone="brand">
                  {t("title")}
                </Typography>
                <Typography variant="lead" tone="muted">
                  {t("description")}
                </Typography>
              </Stack>
              {articles.length ? (
                <Grid className="gap-12 md:grid-cols-2">
                  {articles.map((article) => (
                    <Article key={article.id}>
                      <AppLink
                        href={`/journal/${article.slug}`}
                        className="group block"
                      >
                        <Stack gap="lg">
                          {article.thumbnailUrl ? (
                            <Surface className="relative aspect-[4/3] overflow-hidden">
                              <Media
                                src={article.thumbnailUrl}
                                alt={article.title}
                                fill
                                sizes="(min-width:768px) 50vw, 100vw"
                                className="transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                              />
                            </Surface>
                          ) : null}
                          <Typography as="h2" variant="heading">
                            {article.title}
                          </Typography>
                          <Typography tone="muted">
                            {article.content
                              .replace(/<[^>]*>/g, " ")
                              .replace(/&amp;/g, "&")
                              .replace(/\s+/g, " ")
                              .trim()
                              .slice(0, 160)}
                            …
                          </Typography>
                          <Typography
                            as="span"
                            variant="caption"
                            className="inline-flex items-center gap-2"
                          >
                            {t("read")}
                            <Icon name="arrowUpRight" className="size-4" />
                          </Typography>
                        </Stack>
                      </AppLink>
                    </Article>
                  ))}
                </Grid>
              ) : (
                <Typography tone="muted">{t("empty")}</Typography>
              )}
            </Stack>
          </Container>
        </Section>
      </Main>
      <SiteFooter />
    </>
  );
}
