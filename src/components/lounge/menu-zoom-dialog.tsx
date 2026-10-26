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
import { Icon } from "@/components/ui/icon";
import { Inline, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";
import { MenuArtwork } from "./menu-artwork";

const zoomWidths = [
  "w-full max-w-[600px]",
  "w-[900px] max-w-none",
  "w-[1200px] max-w-none",
  "w-[1800px] max-w-none",
] as const;

export function MenuZoomDialog({
  pages,
  visible,
  page,
}: {
  pages: MenuPage[];
  visible: number[];
  page: number;
}) {
  const t = useTranslations("Menu");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(page);
  const [zoom, setZoom] = useState(0);
  const opener = useRef<HTMLButtonElement>(null);
  const artwork = pages[selected] ?? pages[0];
  function show(event: React.MouseEvent<HTMLButtonElement>, enlarge: boolean) {
    opener.current = event.currentTarget;
    setSelected(page);
    setZoom(enlarge ? 1 : 0);
    setOpen(true);
  }
  if (!artwork) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Inline gap="xs">
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => show(event, true)}
        >
          <Icon name="zoomIn" />
          {t("zoom")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("expand")}
          onClick={(event) => show(event, false)}
        >
          <Icon name="maximize" />
        </Button>
      </Inline>
      <DialogContent
        closeLabel={t("close")}
        className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[1500px] gap-3 overflow-hidden p-3 sm:p-5"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {t("zoom")} · {artwork.label}
          </DialogTitle>
          <DialogDescription>{t("zoomDescription")}</DialogDescription>
        </DialogHeader>
        <Inline gap="xs" className="shrink-0 justify-between">
          <Inline gap="xs">
            {visible.map((index) => (
              <Button
                key={pages[index].id}
                size="sm"
                variant={selected === index ? "primary" : "outline"}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {t("page", { current: index + 1, total: pages.length })}
              </Button>
            ))}
          </Inline>
          <Inline gap="xs">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("zoomOut")}
              disabled={zoom === 0}
              onClick={() => setZoom((value) => Math.max(0, value - 1))}
            >
              <Icon name="minus" />
            </Button>
            <Typography as="span" variant="caption" aria-live="polite">
              {t("zoom")} {zoom + 1}/{zoomWidths.length}
            </Typography>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("zoomIn")}
              disabled={zoom === zoomWidths.length - 1}
              onClick={() =>
                setZoom((value) => Math.min(zoomWidths.length - 1, value + 1))
              }
            >
              <Icon name="plus" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("reset")}
              onClick={() => setZoom(0)}
            >
              <Icon name="reset" />
            </Button>
            <Button asChild variant="ghost" size="icon">
              <AppLink
                href={artwork.image}
                target="_blank"
                aria-label={t("openImage")}
              >
                <Icon name="externalLink" />
              </AppLink>
            </Button>
          </Inline>
        </Inline>
        <Surface
          tabIndex={0}
          aria-label={t("zoomDescription")}
          className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-md bg-[#15201C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006B57]"
        >
          <Surface className={cn("mx-auto", zoomWidths[zoom])}>
            <MenuArtwork key={artwork.id} page={artwork} eager original />
          </Surface>
        </Surface>
      </DialogContent>
    </Dialog>
  );
}
