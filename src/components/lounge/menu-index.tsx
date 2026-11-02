"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { List, ListItem, Navigation } from "@/components/ui/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { menuBookmarks } from "@/lib/menu/menu-bookmarks";
import type { MenuPage } from "@/types/domain";

const tabStyles = {
  entry:
    "relative h-auto min-h-8 w-full justify-start gap-2 rounded-l-none rounded-r-md border-l-2 px-2 py-1.5 text-left whitespace-normal transition-colors motion-reduce:transition-none",
  active: "z-10 border-[#A18B47] bg-[#2E7017] text-white hover:bg-[#2E7017] hover:text-white",
  idle: "border-[#2E7017]/20 bg-[#E5EADD] text-[#15201C] hover:bg-[#D4DFCF]",
} as const;

export function MenuIndex({
  pages,
  page,
  onSelect,
  mode = "tabs",
  disabled = false,
}: {
  pages: MenuPage[];
  page: number;
  onSelect: (index: number) => void;
  mode?: "select" | "tabs";
  disabled?: boolean;
}) {
  const t = useTranslations("Menu");
  const categories = menuBookmarks(
    pages,
    useLocale() === "en",
    mode === "select",
  );
  const selected =
    categories.find((item) => item.pages.includes(page))?.page ?? page;

  if (mode === "select") {
    return (
      <Select
        value={String(selected)}
        onValueChange={(value) => onSelect(Number(value))}
      >
        <SelectTrigger
          disabled={disabled}
          aria-label={t("categories")}
          className="border-[#2E7017]/30 bg-white text-[#15201C]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((item) => (
            <SelectItem key={item.id} value={String(item.page)}>
              {String(item.page + 1).padStart(2, "0")} · {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Navigation aria-label={t("categories")} className="block self-start">
      <List ordered className="space-y-0.5">
        {categories.map((item) => (
          <ListItem key={item.id}>
            <Button
              disabled={disabled}
              variant="ghost"
              size="sm"
              aria-current={item.pages.includes(page) ? "page" : undefined}
              onClick={() => onSelect(item.page)}
              className={cn(
                tabStyles.entry,
                item.pages.includes(page) ? tabStyles.active : tabStyles.idle,
              )}
            >
              <Typography
                as="span"
                variant="caption"
                className="w-5 shrink-0 tabular-nums"
              >
                {String(item.page + 1).padStart(2, "0")}
              </Typography>
              <Typography as="span" variant="caption" className="leading-tight">
                {item.label}
              </Typography>
            </Button>
          </ListItem>
        ))}
      </List>
    </Navigation>
  );
}
