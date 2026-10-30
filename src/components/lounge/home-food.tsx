"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { HoverPopover, HoverPopoverContent, HoverPopoverTrigger } from "@/components/ui/hover-popover";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import type { AppLocale } from "@/i18n/config";
import { foodStyles } from "@/lib/ui/home-styles";

export function HomeFood({ locale }: { locale: AppLocale }) {
  const t = useTranslations("PreservedHome");
  const [active, setActive] = useState<string | null>(null);
  const [dismissKey, setDismissKey] = useState(0);
  const closeDetails = useCallback(() => { setActive(null); setDismissKey(key => key + 1); }, []);
  return <Section id="food" data-home-section="food" aria-labelledby="food-heading" className={foodStyles.section}><Container>
    <Carousel label={t("foodTitle")} columns={4} rows={2} controlPosition="sides" step="responsive" showCounter={false} onNavigate={closeDetails}
      heading={<Reveal><Stack gap="md"><Typography as="h2" variant="title" id="food-heading">{t("foodTitle")}</Typography><Typography variant="lead" className="max-w-2xl">{t("foodDescription")}</Typography></Stack></Reveal>}
      action={<Button asChild><AppLink href="/menu">{t("exploreMenu")}<Icon name="arrowUpRight" /></AppLink></Button>}>
      {source.products.map(item => <CarouselItem key={item.id} data-source-id={item.id}>
        <HoverPopover followCursor resetKey={dismissKey} open={active === item.id} onOpenChange={open => setActive(current => open ? item.id : current === item.id ? null : current)} className={foodStyles.item}>
          <Article>
            <HoverPopoverTrigger navigate><AppLink href={`/menu/${item.id}`} aria-label={t("foodDetails", { name: item.title[locale] })} aria-describedby={active === item.id ? `food-description-${item.id}` : undefined} className={foodStyles.trigger}>
              <Surface className={foodStyles.photo}>{item.image.src ? <Media src={item.image.src} alt={item.title[locale]} fill sizes="(min-width:1024px) 22vw, (min-width:640px) 40vw, 70vw" /> : null}<Surface aria-hidden="true" className={foodStyles.thumbnailOverlay}><Icon name="eye" className={foodStyles.previewEye} /></Surface></Surface>
              <Stack gap="xs" className="pt-3"><Typography as="h3" variant="body" className={foodStyles.title}>{item.title[locale]}</Typography><Typography variant="small" className={foodStyles.description}>{item.description[locale]}</Typography></Stack>
            </AppLink></HoverPopoverTrigger>
          </Article>
          <HoverPopoverContent className={foodStyles.preview} closeLabel={t("closeFoodDetails")} aria-labelledby={`food-title-${item.id}`} aria-describedby={`food-description-${item.id}`}>
            <Stack gap="sm"><Surface className={foodStyles.photo}>{item.image.src ? <Media src={item.image.src} alt="" fill sizes="320px" /> : null}</Surface><Stack gap="none" className={foodStyles.previewText}><Typography as="h3" variant="subheading" id={`food-title-${item.id}`}>{item.title[locale]}</Typography><Typography id={`food-description-${item.id}`}>{item.description[locale]}</Typography></Stack></Stack>
          </HoverPopoverContent>
        </HoverPopover>
      </CarouselItem>)}
    </Carousel>
  </Container></Section>;
}
