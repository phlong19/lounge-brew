import { getTranslations } from "next-intl/server";
import { RichText } from "@/components/content/rich-text";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Grid, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { dayStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

export async function HomeIntroduction({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("PreservedHome");
  return <Section id="introduction" data-home-section="introduction" aria-labelledby="introduction-heading" className="py-0 md:py-0">
    <Container className="py-12 md:py-16">
      <Reveal><Stack gap="md"><Typography as="h2" variant="title" id="introduction-heading">{t("dayTitle")}</Typography><Typography variant="lead" className="max-w-2xl">{t("dayDescription")}</Typography></Stack></Reveal>
    </Container>
    {source.introduction.map((item, index) => <Article key={item.id} id={item.id} data-source-id={item.id} aria-labelledby={`${item.id}-heading`} className={cn(dayStyles.chapter, dayStyles.fields[index])}>
      <Container><Grid className="items-center gap-8 lg:grid-cols-12 lg:gap-14">
        <Reveal className={cn("lg:col-span-6", index === 1 && "lg:order-2")}>
          <Surface className={cn(dayStyles.photo, index === 1 ? "aspect-[4/3] lg:aspect-square" : "aspect-[4/3]")}>
            {item.image.src ? <Media src={item.image.src} alt={item.title[locale]} fill sizes="(min-width:1024px) 48vw, 100vw" /> : null}
          </Surface>
        </Reveal>
        <Reveal className={cn("lg:col-span-6", index === 1 && "lg:order-1")}>
          <Stack gap="lg">
            <Typography as="h3" variant="subheading" id={`${item.id}-heading`}>{item.title[locale]}</Typography>
            <RichText content={item.content[locale]} tone={index === 2 ? "inverse" : "ink"} />
            {index < 2 ? <AppLink href={item.localHref} className={dayStyles.action}>{t(index === 0 ? "exploreMenu" : "seeProgramme")}<Icon name="arrowUpRight" /></AppLink> : null}
          </Stack>
        </Reveal>
      </Grid></Container>
    </Article>)}
  </Section>;
}
