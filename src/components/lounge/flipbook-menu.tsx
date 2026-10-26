"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Grid,
  Inline,
  List,
  ListItem,
  NoScript,
  Stack,
  Status,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";
import { MenuArtwork } from "./menu-artwork";
import { MenuIndex, MenuThumbnails } from "./menu-index";
import { MenuZoomDialog } from "./menu-zoom-dialog";
import { useMenuViewer } from "./use-menu-viewer";

const MenuBook = dynamic(
  () => import("./menu-book").then((module) => module.MenuBook),
  { ssr: false },
);
const viewerStyles = {
  root: "rounded-lg border border-[#FFFAE7]/15 bg-[#15201C] p-4 text-[#FFFAE7] sm:p-6 lg:p-8",
  stage:
    "grid w-full place-items-center overflow-hidden rounded-sm bg-black/20 p-1 sm:p-4",
  single: "mx-auto w-full max-w-[560px]",
  spread: "mx-auto w-full max-w-[900px]",
  layer: "col-start-1 row-start-1 w-full",
} as const;

export function FlipbookMenu({ pages }: { pages: MenuPage[] }) {
  const t = useTranslations("Menu");
  const viewer = useMenuViewer(pages.length);
  const [readyMode, setReadyMode] = useState<string | null>(null);
  const mode = viewer.spread ? "spread" : "single";
  const engineReady = readyMode === mode && !viewer.reducedMotion;
  const current = viewer.visible[0] ?? 0;
  const last = viewer.visible.at(-1) ?? 0;
  if (!pages.length) return <Status>{t("imageError")}</Status>;
  const progress =
    viewer.visible.length === 2
      ? t("spread", { from: current + 1, to: last + 1, total: pages.length })
      : t("page", { current: current + 1, total: pages.length });

  return (
    <Surface className={viewerStyles.root}>
      <Grid className="lg:grid-cols-[190px_minmax(0,1fr)]" gap="lg">
        <MenuIndex pages={pages} page={viewer.page} onSelect={viewer.goTo} />
        <Stack gap="md" className="min-w-0">
          <Surface
            role="region"
            aria-label={t("title")}
            aria-describedby="menu-keyboard-hint"
            tabIndex={0}
            onKeyDown={viewer.onKeyDown}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6B573]"
          >
            <Stack gap="md">
              <Inline className="justify-between" gap="sm">
                <Inline gap="xs">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={current === 0}
                    aria-label={t("previous")}
                    onClick={() => viewer.step(-1)}
                  >
                    <Icon name="chevronLeft" />
                  </Button>
                  <Status className="min-w-24 text-center">{progress}</Status>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={last === pages.length - 1}
                    aria-label={t("next")}
                    onClick={() => viewer.step(1)}
                  >
                    <Icon name="chevronRight" />
                  </Button>
                </Inline>
                <MenuZoomDialog
                  pages={pages}
                  visible={viewer.visible}
                  page={viewer.page}
                />
              </Inline>
              <Surface className={viewerStyles.stage}>
                <Grid
                  className={
                    viewer.spread ? viewerStyles.spread : viewerStyles.single
                  }
                  gap="none"
                >
                  <Grid
                    gap="none"
                    aria-hidden={engineReady}
                    className={cn(
                      viewerStyles.layer,
                      viewer.visible.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-1",
                      engineReady && "invisible",
                    )}
                  >
                    {viewer.visible.map((index) => (
                      <MenuArtwork
                        key={pages[index].id}
                        page={pages[index]}
                        eager
                        className={
                          viewer.visible.length === 1 && viewer.spread
                            ? "mx-auto max-w-[450px]"
                            : undefined
                        }
                      />
                    ))}
                  </Grid>
                  {!viewer.reducedMotion ? (
                    <Surface
                      className={cn(
                        viewerStyles.layer,
                        !engineReady && "invisible",
                      )}
                    >
                      <MenuBook
                        key={mode}
                        pages={pages}
                        page={viewer.page}
                        spread={viewer.spread}
                        onPageChange={viewer.goTo}
                        onReady={() => setReadyMode(mode)}
                      />
                    </Surface>
                  ) : null}
                </Grid>
              </Surface>
            </Stack>
          </Surface>
          <Typography
            id="menu-keyboard-hint"
            variant="small"
            className="text-stone-300"
          >
            {t("useKeyboard")}
          </Typography>
          <MenuThumbnails
            pages={pages}
            page={viewer.page}
            visible={viewer.visible}
            onSelect={viewer.goTo}
          />
          <Typography variant="small" className="text-stone-300">
            {t("hint")}
          </Typography>
        </Stack>
      </Grid>
      <NoScript>
        <Stack gap="sm" className="mt-6 border-t border-[#FFFAE7]/20 pt-6">
          <Typography as="h2" variant="subheading">
            {t("allPages")}
          </Typography>
          <List className="grid gap-2 sm:grid-cols-2">
            {pages.map((item, index) => (
              <ListItem key={item.id}>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <AppLink href={item.image} target="_blank">
                    {index + 1}. {item.label}
                    <Icon name="externalLink" />
                  </AppLink>
                </Button>
              </ListItem>
            ))}
          </List>
        </Stack>
      </NoScript>
    </Surface>
  );
}
