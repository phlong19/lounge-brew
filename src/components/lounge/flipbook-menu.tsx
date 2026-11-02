"use client";
import dynamic from "next/dynamic";
import { PhoneMenu } from "./phone-menu";
import { compactMenuPages } from "@/lib/menu/menu-state";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Grid,
  List,
  ListItem,
  NoScript,
  Stack,
  Status,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { menuStyles as s } from "@/lib/ui/menu-styles";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";
import { MenuArtwork } from "./menu-artwork";
import { MenuIndex } from "./menu-index";
import { useMenuViewer } from "./use-menu-viewer";
const MenuBook = dynamic(
  () => import("./menu-book").then((module) => module.MenuBook),
  { ssr: false },
);
export function FlipbookMenu({ pages }: { pages: MenuPage[] }) {
  const t = useTranslations("Menu"),
    viewer = useMenuViewer(pages.length);
  const visiblePages = useMemo(() => viewer.spread ? pages : compactMenuPages(pages.length).map(index => pages[index]), [pages, viewer.spread]);
  // The flip engine requires dense indices; public URLs/bookmarks keep physical numbers.
  const enginePages = useMemo(() => viewer.spread ? pages : visiblePages.map((item, index) => ({ ...item, physicalIndex: index })), [pages, viewer.spread, visiblePages]);
  const enginePage = Math.max(0, visiblePages.findIndex(item => item.physicalIndex === viewer.page));
  const [readyMode, setReadyMode] = useState<string | null>(null),
    [motionTarget, setMotionTarget] = useState<number | null>(null);
  const mode = viewer.spread ? "spread" : "portrait",
    engineReady = readyMode === mode && !viewer.reducedMotion;
  const current = viewer.visible[0] ?? 0,
    last = viewer.visible.at(-1) ?? 0,
    presentation = motionTarget ?? viewer.page;
  if (!pages.length) return <Status>{t("imageError")}</Status>;
  if (viewer.phone) return <PhoneMenu pages={visiblePages} page={viewer.page} onSelect={viewer.goTo} />;
  return (
    <Surface className={s.panel} data-menu-viewer>
      <Surface className="px-4 pt-4 lg:hidden">
        <MenuIndex
          mode="select"
          pages={visiblePages}
          page={viewer.page}
          onSelect={viewer.goTo}
        />
      </Surface>
      <Grid
        gap="none"
        className="lg:grid-cols-[minmax(0,1fr)_150px] lg:items-center"
      >
        <Surface
          role="region"
          aria-label={t("title")}
          aria-describedby="menu-keyboard-hint"
          tabIndex={0}
          onKeyDown={(event) => {
            viewer.onKeyDown(event);
          }}
          className={s.region}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(s.arrow, s.previous)}
            disabled={current === visiblePages[0].physicalIndex}
            aria-label={t("previous")}
            onClick={() => viewer.step(-1)}
          >
            <Icon name="chevronLeft" />
          </Button>
          <Surface
            className={cn(s.stage, viewer.spread ? s.spread : s.portrait)}
            data-menu-stage
            data-menu-mode={mode}
          >
            <Surface
              className={cn(
                s.frame,
                viewer.spread ? s.spreadFrame : s.portraitFrame,
                viewer.spread &&
                  (presentation === 0
                    ? s.front
                    : presentation === pages.length - 1
                      ? s.back
                      : s.open),
              )}
              data-menu-frame
              data-menu-position={
                presentation === 0
                  ? "front"
                  : presentation === pages.length - 1
                    ? "back"
                    : "open"
              }
            >
              <Grid
                gap="none"
                aria-hidden={engineReady}
                className={cn(
                  s.fallback,
                  viewer.spread ? "grid-cols-2" : "grid-cols-1",
                  engineReady && "invisible",
                )}
              >
                {viewer.visible.map((index) => (
                  <MenuArtwork
                    key={pages[index].id}
                    page={pages[index]}
                    eager
                    className={cn(
                      "min-h-0",
                      viewer.spread && index === 0 && "col-start-2",
                      viewer.spread &&
                        index === pages.length - 1 &&
                        "col-start-1",
                    )}
                  />
                ))}
              </Grid>
              {!viewer.reducedMotion ? (
                <Surface className={cn(s.engine, !engineReady && "invisible")}>
                  <MenuBook
                    key={mode}
                    pages={enginePages}
                    page={enginePage}
                    spread={viewer.spread}
                    onPageChange={index => viewer.goTo(visiblePages[index].physicalIndex)}
                    onMotionTarget={index => setMotionTarget(index === null ? null : visiblePages[index].physicalIndex)}
                    onReady={() => {
                      setReadyMode(mode);
                    }}
                  />
                </Surface>
              ) : null}
            </Surface>
          </Surface>
          <Button
            variant="ghost"
            size="icon"
            className={cn(s.arrow, s.next)}
            disabled={last === visiblePages[visiblePages.length - 1].physicalIndex}
            aria-label={t("next")}
            onClick={() => viewer.step(1)}
          >
            <Icon name="chevronRight" />
          </Button>
        </Surface>
        <Surface className="hidden pr-4 py-8 lg:block">
          <MenuIndex
            pages={visiblePages}
            page={viewer.page}
            onSelect={viewer.goTo}
            />
        </Surface>
      </Grid>
      <Typography id="menu-keyboard-hint" variant="small" className="sr-only">
        {t("useKeyboard")}
      </Typography>
      <NoScript>
        <Stack gap="sm" className="border-t border-white/15 p-6 text-white">
          <Typography as="h2" variant="subheading">
            {t("allPages")}
          </Typography>
          <List className="grid gap-2 sm:grid-cols-2">
            {visiblePages.map((item) => (
              <ListItem key={item.id}>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start bg-white"
                >
                  <AppLink href={item.image} target="_blank">
                    {item.physicalIndex + 1}. {item.label}
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
