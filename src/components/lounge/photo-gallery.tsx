"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Grid, Surface, VisuallyHidden } from "@/components/ui/layout";
import { Media } from "@/components/ui/media";

const photos = [
  { src: "/trixie/venue-1.jpg", alt: "cafeAlt" },
  { src: "/trixie/venue-3.jpg", alt: "loungeAlt" },
  { src: "/trixie/gallery-2.jpg", alt: "loungeAlt" },
  { src: "/trixie/gallery-3.jpg", alt: "loungeAlt" },
] as const;

export function PhotoGallery() {
  const t = useTranslations("Site");
  const [selected, setSelected] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <Grid className="grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {photos.map((photo, index) => (
          <Button
            key={photo.src}
            variant="ghost"
            className="h-auto min-w-0 overflow-hidden rounded-none border-0 p-0"
            aria-label={t("viewPhoto", { number: index + 1 })}
            onClick={(event) => {
              opener.current = event.currentTarget;
              setSelected(index);
            }}
          >
            <Surface className="relative aspect-[3/4] w-full overflow-hidden">
              <Media
                src={photo.src}
                alt={t(photo.alt)}
                fill
                sizes="(min-width:768px) 25vw, 50vw"
                className="transition-transform duration-500 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
              />
            </Surface>
          </Button>
        ))}
      </Grid>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          closeLabel={t("closePhoto")}
          className="max-w-5xl bg-white p-3 md:p-5"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
        >
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{t("photoTitle")}</DialogTitle>
              <DialogDescription>{t("photoDescription")}</DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
          {selected !== null ? (
            <Media
              src={photos[selected].src}
              alt={t(photos[selected].alt)}
              width={1600}
              height={1067}
              fit="contain"
              className="max-h-[80dvh] w-full"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
