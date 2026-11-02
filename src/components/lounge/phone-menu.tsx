"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PagedCarousel } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Inline, Stack, Surface } from "@/components/ui/layout";
import { MenuArtwork } from "./menu-artwork";
import { MenuIndex } from "./menu-index";
import { menuStyles as s } from "@/lib/ui/menu-styles";
import type { MenuPage } from "@/types/domain";

export function PhoneMenu({ pages, page, onSelect }: { pages: MenuPage[]; page: number; onSelect: (index: number) => void }) {
  const t = useTranslations("Menu");
  const index = Math.max(0, pages.findIndex(item => item.physicalIndex === page));
  return <Surface className={s.panel} data-menu-viewer data-menu-mode="phone">
    <Stack gap="sm" className="p-2 pt-4">
      <Surface className="px-2 pb-2"><MenuIndex mode="select" pages={pages} page={page} onSelect={onSelect} /></Surface>
      <PagedCarousel label={t("title")} index={index} onIndexChange={next => { if (pages[next]) onSelect(pages[next].physicalIndex); }} className={s.portrait}>
        {pages.map((item, slide) => <MenuArtwork key={item.id} page={item} eager={Math.abs(slide - index) <= 1} />)}
      </PagedCarousel>
      <Inline className="justify-between pt-1 pb-2">
        <Button variant="ghost" size="icon" className={s.arrow} disabled={index === 0} aria-label={t("previous")} onClick={() => onSelect(pages[index - 1].physicalIndex)}><Icon name="chevronLeft" /></Button>
        <Button variant="ghost" size="icon" className={s.arrow} disabled={index === pages.length - 1} aria-label={t("next")} onClick={() => onSelect(pages[index + 1].physicalIndex)}><Icon name="chevronRight" /></Button>
      </Inline>
    </Stack>
  </Surface>;
}
