"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Grid, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { foodStyles } from "@/lib/ui/home-styles";
import { foodGroups, type FoodGroup } from "@/lib/lounge/food-groups";
import { cn } from "@/lib/utils";

export function HomeFood({ locale }: { locale: AppLocale }) {
  const t = useTranslations("PreservedHome");
  const [selected, setSelected] = useState<FoodGroup>("drinks");
  return <Section id="food" data-home-section="food" aria-labelledby="food-heading" className={foodStyles.section}>
    <Container><Stack gap="lg">
      <Inline className="items-end justify-between gap-6">
        <Reveal><Stack gap="md"><Typography as="h2" variant="title" id="food-heading">{t("foodTitle")}</Typography><Typography variant="lead" className="max-w-2xl">{t("foodDescription")}</Typography></Stack></Reveal>
        <Button asChild><AppLink href="/menu">{t("exploreMenu")}<Icon name="arrowUpRight" /></AppLink></Button>
      </Inline>
      <Inline role="group" aria-label={t("foodCategories")} gap="sm" className="items-stretch">
        {foodGroups.map(group => <Button key={group.id} variant="ghost" aria-pressed={selected === group.id} aria-controls={`food-${group.id}`} onClick={() => setSelected(group.id)} className={foodStyles.filter}>
          <Typography as="span" variant="body" className="font-semibold">{t(group.label)}</Typography><Typography as="span" variant="small" className="tabular-nums">{group.productIds.length}</Typography>
        </Button>)}
      </Inline>
      {foodGroups.map(group => <Surface key={group.id} id={`food-${group.id}`} hidden={selected !== group.id} role="region" aria-label={t(group.label)}>
        <Grid className={foodStyles.grid}>
          {source.products.filter(item => (group.productIds as readonly string[]).includes(item.id)).map((item, index) => <Article key={item.id} data-source-id={item.id} className={foodStyles.slots[index % 4]}>
            <AppLink href={item.sourceUrl} target="_blank" className={foodStyles.item}>
              <Surface className={cn(foodStyles.photo, "aspect-[3/2]")}>
                {item.image.src ? <Media src={item.image.src} alt={item.title[locale]} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 112px" /> : null}
              </Surface>
              <Stack gap="xs" className="sm:pt-3"><Inline className="flex-nowrap items-start justify-between" gap="sm"><Typography as="h3" variant="body" className="font-semibold group-hover:underline group-focus-visible:underline">{item.title[locale]}</Typography><Icon name="arrowUpRight" className="mt-1 shrink-0" /></Inline><Typography variant="small">{item.description[locale]}</Typography></Stack>
            </AppLink>
          </Article>)}
        </Grid>
      </Surface>)}
    </Stack></Container>
  </Section>;
}
