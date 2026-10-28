"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Section, Stack, Surface } from "@/components/ui/layout";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import { archiveStyles } from "@/lib/ui/home-styles";
import { surfaceStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/config";

type ArchiveItem = typeof source.archive[number];
export function HomeArchive({ locale }: { locale: AppLocale }) {
  const t = useTranslations("PreservedHome");
  const [selected, setSelected] = useState<ArchiveItem | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return <Section id="archive" data-home-section="archive" aria-labelledby="archive-heading" className="bg-white">
    <Container><Carousel label={t("archiveTitle")} columns={4} controls={false} autoScroll paused={selected !== null} heading={<Reveal><Stack gap="sm"><Typography as="h2" variant="title" id="archive-heading">{t("archiveTitle")}</Typography><Typography variant="lead">{t("archiveDescription")}</Typography></Stack></Reveal>}>
      {source.archive.map(item => <CarouselItem key={item.id} data-source-id={item.id}><Article>
        {item.image.src ? <Button variant="ghost" aria-haspopup="dialog" aria-label={t("openArchivePhoto", { name: item.title })} className={archiveStyles.trigger} onClick={event => { trigger.current = event.currentTarget; setSelected(item); }}>
          <Media src={item.image.src} alt={item.sourceTitle || item.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className={archiveStyles.image} />
          <Icon name="maximize" className={archiveStyles.expand} />
        </Button> : <Surface className={cn("relative aspect-[4/3] overflow-hidden", surfaceStyles.evening)}><Stack className="h-full items-center justify-center p-5 text-center"><Icon name="music" className="size-8" /><Typography variant="small">{t("unavailableAlbum")}</Typography></Stack></Surface>}
        <Stack gap="sm" className="pt-5"><Typography as="h3" variant="subheading">{item.title}</Typography>{item.date ? <Typography as="time" dateTime={item.date} variant="small">{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${item.date}T12:00:00+07:00`))}</Typography> : null}</Stack>
      </Article></CarouselItem>)}
    </Carousel></Container>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent closeLabel={t("closeArchivePhoto")} aria-describedby={undefined} className={archiveStyles.dialog} onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); }}>
        <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
        {selected?.image.src ? <Surface className={archiveStyles.fullPhoto}><Media src={selected.image.src} alt={selected.sourceTitle || selected.title} fill fit="contain" sizes="(min-width:1024px) 960px, 100vw" /></Surface> : null}
      </DialogContent>
    </Dialog>
  </Section>;
}
