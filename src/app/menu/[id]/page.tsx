import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Main, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { foodStyles } from "@/lib/ui/home-styles";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  const food = source.products.find(item => item.id === id);
  return { title: food?.title[locale as AppLocale], description: food?.description[locale as AppLocale], robots: { index: false, follow: true } };
}

/** Initial detail destination, using the same verified content as the food preview. */
export default async function FoodDetailPage({ params }: Props) {
  const [{ id }, locale, t] = await Promise.all([params, getLocale(), getTranslations("PreservedHome")]);
  const food = source.products.find(item => item.id === id);
  if (!food) notFound();
  const lang = locale as AppLocale;
  return <><SiteHeader active="menu" /><Main id="main-content"><Section><Container>
    <Stack gap="lg">
      <AppLink href="/#food" className={foodStyles.backLink}><Icon name="arrowLeft" />{t("backToFood")}</AppLink>
      <Grid className={foodStyles.detailGrid}>
        <Surface className={foodStyles.photo}>{food.image.src ? <Media src={food.image.src} alt={food.title[lang]} fill priority sizes="(min-width:1024px) 50vw, 100vw" /> : null}</Surface>
        <Stack gap="lg" className="items-start"><Typography as="h1" variant="title">{food.title[lang]}</Typography><Typography variant="lead">{food.description[lang]}</Typography><Button asChild><AppLink href="/menu">{t("exploreMenu")}<Icon name="arrowUpRight" /></AppLink></Button></Stack>
      </Grid>
    </Stack>
  </Container></Section></Main><SiteFooter compact /></>;
}
