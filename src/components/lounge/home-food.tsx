import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { surfaceStyles } from "@/lib/ui/styles";

export async function HomeFood({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("PreservedHome");
  return <Section id="food" data-home-section="food" aria-labelledby="food-heading" className={surfaceStyles.stone}>
    <Container><Stack gap="xl">

      <Carousel label={t("foodTitle")} columns={3} heading={<Reveal><Stack gap="sm"><Typography as="h2" variant="title" id="food-heading">{t("foodTitle")}</Typography><Typography variant="lead" className="max-w-2xl">{t("foodDescription")}</Typography></Stack></Reveal>} action={<Button asChild><AppLink href="/menu">{t("exploreMenu")}<Icon name="arrowUpRight" /></AppLink></Button>}>
        {source.products.map(item => <CarouselItem key={item.id} data-source-id={item.id}><Article><AppLink href={item.sourceUrl} target="_blank" className="block">
          <Surface className="relative aspect-[4/3] overflow-hidden bg-white">{item.image.src ? <Media src={item.image.src} alt={item.title[locale]} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" /> : null}</Surface>
          <Stack gap="sm" className="pt-5"><Typography as="h3" variant="subheading">{item.title[locale]}</Typography><Typography>{item.description[locale]}</Typography><Inline gap="xs"><Typography as="span" variant="small">{t("dishDetails")}</Typography><Icon name="arrowUpRight" className="size-4" /></Inline></Stack>
        </AppLink></Article></CarouselItem>)}
      </Carousel>
    </Stack></Container>
  </Section>;
}
