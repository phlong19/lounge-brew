"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Grid, Inline, Stack, Surface, VisuallyHidden } from "@/components/ui/layout";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { photoSliderStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

const photos = [
  { src: "/trixie/drink-2.jpg", alt: "drinkAlt", crop: "object-center" },
  { src: "/trixie/gallery-1.jpg", alt: "loungeAlt", crop: "object-[65%_center]" },
  { src: "/trixie/gallery-4.jpg", alt: "loungeAlt", crop: "object-center" },
  { src: "/trixie/venue-1.jpg", alt: "cafeAlt", crop: "object-center" },
] as const;

export function PhotoGallery() {
  const t = useTranslations("Site");
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const choose = (index: number) => setActive((index + photos.length) % photos.length);

  return (
    <>
      <Stack
        gap="lg"
        aria-label={t("photoTitle")}
        aria-roledescription={t("imageSlider")}
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            choose(active + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onTouchStart={event => { const point = event.touches[0]; touch.current = point ? { x: point.clientX, y: point.clientY } : null; }}
        onTouchEnd={event => {
          const end = event.changedTouches[0];
          if (touch.current && end) {
            const dx = end.clientX - touch.current.x;
            const dy = end.clientY - touch.current.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) choose(active + (dx < 0 ? 1 : -1));
          }
          touch.current = null;
        }}
      >
        <Button
          variant="ghost"
          className={photoSliderStyles.mainButton}
          aria-label={t("viewPhoto", { number: active + 1 })}
          onClick={event => { opener.current = event.currentTarget; setSelected(active); }}
        >
          <Surface className={photoSliderStyles.frame}>
            {photos.map((photo, index) => <Surface key={photo.src} aria-hidden={index !== active} className={cn(photoSliderStyles.slide, index === active ? "opacity-100" : "opacity-0")}><Media src={photo.src} alt={t(photo.alt)} fill sizes="(min-width:1280px) 1200px, 100vw" className={photo.crop} /></Surface>)}
            <Surface className={photoSliderStyles.expand}><Icon name="maximize" /></Surface>
          </Surface>
        </Button>
        <Inline className="justify-between" gap="sm">
          <Stack gap="xs"><Typography variant="caption" aria-live="polite" aria-atomic="true">{t("photoPosition", { current: active + 1, total: photos.length })}</Typography><Typography variant="small" tone="muted">{t("sliderHint")}</Typography></Stack>
          <Inline gap="xs"><Button variant="outline" size="icon" aria-label={t("previousPhoto")} onClick={() => choose(active - 1)}><Icon name="arrowLeft" /></Button><Button variant="outline" size="icon" aria-label={t("nextPhoto")} onClick={() => choose(active + 1)}><Icon name="arrowRight" /></Button></Inline>
        </Inline>
        <Grid className="grid-cols-4 gap-3 md:gap-5">
          {photos.map((photo, index) => <Button key={photo.src} variant="ghost" aria-label={t("selectPhoto", { number: index + 1 })} aria-pressed={active === index} onClick={() => choose(index)} className={cn(photoSliderStyles.thumbnail, active === index ? "opacity-100" : "opacity-50 hover:opacity-100")}><Surface className="relative aspect-[16/10] w-full"><Media src={photo.src} alt="" fill sizes="(min-width:1280px) 300px, 25vw" className={photo.crop} /></Surface></Button>)}
        </Grid>
      </Stack>
      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent closeLabel={t("closePhoto")} className="max-w-5xl bg-white p-3 md:p-5" onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}>
          <VisuallyHidden><DialogHeader><DialogTitle>{t("photoTitle")}</DialogTitle><DialogDescription>{t("photoDescription")}</DialogDescription></DialogHeader></VisuallyHidden>
          {selected !== null ? <Media src={photos[selected].src} alt={t(photos[selected].alt)} width={1600} height={1067} fit="contain" className="max-h-[80dvh] w-full" /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
