import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Grid, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export async function HomeIntroduction({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("PreservedHome");
  return <Section id="introduction" data-home-section="introduction" aria-labelledby="introduction-heading" className="bg-white">
    <Container><Stack gap="2xl">
      <Reveal><Typography as="h2" variant="title" tone="brand" id="introduction-heading">{t("introductionTitle")}</Typography></Reveal>
      {source.introduction.map((item,index) => <Article key={item.id} id={item.id} data-source-id={item.id}>
        <Grid className="items-center gap-8 md:grid-cols-2 lg:gap-20">
          <Reveal className={cn(index === 1 && "md:order-2")}><Surface className="relative aspect-[4/3] overflow-hidden">{item.image.src ? <Media src={item.image.src} alt={item.title[locale]} fill sizes="(min-width:768px) 50vw, 100vw" /> : null}</Surface></Reveal>
          <Reveal className={cn(index === 1 && "md:order-1")}><Stack gap="lg"><Typography as="h3" variant="heading">{item.title[locale]}</Typography><Typography variant="lead">{item.description[locale]}</Typography><AppLink href={item.localHref} className="inline-flex min-h-11 w-fit items-center gap-3 font-medium hover:underline">{t(index === 0 ? "exploreMenu" : index === 1 ? "seeProgramme" : "loungeDetails")}<Icon name="arrowUpRight" /></AppLink></Stack></Reveal>
        </Grid>
      </Article>)}
    </Stack></Container>
  </Section>;
}
