import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { RichText } from "@/components/content/rich-text";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Icon } from "@/components/ui/icon";
import {
  Article,
  Container,
  Main,
  Section,
  Stack,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { localizeArticle } from "@/lib/menu/map-menu";
import { getArticleBySlug } from "@/lib/server/lounge-data";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const { article } = await getArticleBySlug(slug);
  return {
    title: article
      ? localizeArticle(locale as AppLocale, article).title
      : "Trixie",
  };
}
export default async function JournalArticlePage({ params }: Props) {
  const [{ slug }, locale, t] = await Promise.all([
    params,
    getLocale(),
    getTranslations("Stories"),
  ]);
  const { article: row } = await getArticleBySlug(slug);
  if (!row) notFound();
  const article = localizeArticle(locale as AppLocale, row);
  return (
    <>
      <SiteHeader active="journal" />
      <Main id="main-content">
        <Section>
          <Container className="max-w-4xl">
            <Stack gap="xl">
              <AppLink
                href="/journal"
                className="inline-flex min-h-11 w-fit items-center gap-2 hover:underline"
              >
                <Icon name="arrowLeft" className="size-4" />
                {t("back")}
              </AppLink>
              <Article>
                <Stack gap="xl">
                  <Stack gap="lg">
                    <Typography as="h1" variant="title" tone="brand">
                      {article.title}
                    </Typography>
                    {article.publishedAt ? (
                      <Typography
                        as="time"
                        dateTime={article.publishedAt}
                        variant="small"
                        tone="muted"
                      >
                        {new Intl.DateTimeFormat(
                          locale === "vi" ? "vi-VN" : "en-GB",
                          { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" },
                        ).format(new Date(article.publishedAt))}
                      </Typography>
                    ) : null}
                  </Stack>
                  {article.thumbnailUrl ? (
                    <Surface className="relative aspect-[16/10] overflow-hidden">
                      <Media
                        src={article.thumbnailUrl}
                        alt={article.title}
                        fill
                        priority
                        sizes="(min-width:1024px) 800px, 100vw"
                      />
                    </Surface>
                  ) : null}
                  {article.fallbackFromVietnamese && locale === "en" ? (
                    <Typography variant="small" tone="muted">
                      {t("fallback")}
                    </Typography>
                  ) : null}
                  <RichText content={article.content} />
                </Stack>
              </Article>
            </Stack>
          </Container>
        </Section>
      </Main>
      <SiteFooter />
    </>
  );
}
