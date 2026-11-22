import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import {
  Article,
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
import type { AppLocale } from "@/i18n/config";
import { localizeArticles } from "@/lib/menu/map-menu";
import { formatDate } from "@/lib/dates";
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
              <Typography as="h1" variant="display" tone="brand">
                {t("title")}
              </Typography>
              {articles.length ? (
                <Grid className="gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {articles.map((article) => {
                    const excerpt = article.content
                      .replace(/<[^>]*>/g, " ")
                      .replace(/&amp;/g, "&")
                      .replace(/\s+/g, " ")
                      .trim();
                    return (
                      <Article key={article.id}>
                        <AppLink
                          href={`/journal/${article.slug}`}
                          className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#15201C]/15 bg-white transition-[background-color,border-color,box-shadow] hover:border-[#2E7017] hover:bg-[#FFFAE7] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#2E7017] focus-visible:ring-offset-2 motion-reduce:transition-none"
                        >
                          {article.thumbnailUrl ? (
                            <Surface className="relative aspect-[16/10] overflow-hidden bg-[#F1EEE7]">
                              <Media
                                src={article.thumbnailUrl}
                                alt=""
                                fill
                                sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw"
                                className="transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                              />
                            </Surface>
                          ) : null}
                          <Stack gap="sm" className="flex-1 p-5 md:p-6">
                            {article.publishedAt ? (
                              <Typography as="time" dateTime={article.publishedAt} variant="caption" tone="muted">
                                {formatDate(article.publishedAt)}
                              </Typography>
                            ) : null}
                            <Inline className="flex-nowrap items-start justify-between" gap="sm">
                              <Typography as="h2" variant="subheading" className="underline-offset-4 group-hover:text-[#2E7017] group-focus-visible:underline">
                                {article.title}
                              </Typography>
                              <Icon name="arrowUpRight" className="mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                            </Inline>
                            {excerpt ? (
                              <Typography variant="small" tone="muted" className="line-clamp-3">
                                {excerpt.length > 240 ? `${excerpt.slice(0, 240).replace(/\s+\S*$/, "")}…` : excerpt}
                              </Typography>
                            ) : null}
                          </Stack>
                        </AppLink>
                      </Article>
                    );
                  })}
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
