"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { List, ListItem, Navigation } from "@/components/ui/layout";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

const tabStyles = {
  entry:
    "relative h-auto min-h-8 w-full justify-start gap-2 rounded-l-none rounded-r-md border-l-2 px-2 py-1.5 text-left whitespace-normal transition-colors motion-reduce:transition-none",
  active: "z-10 border-[#A18B47] bg-[#006B57] text-white",
  idle: "border-[#006B57]/20 bg-[#E5EADD] text-[#15201C] hover:bg-[#D4DFCF]",
} as const;

export function MenuIndex({
  pages, page, onSelect, mode = "tabs",
}: {
  pages: MenuPage[];
  page: number;
  onSelect: (index: number) => void;
  mode?: "select" | "tabs";
}) {
  const t = useTranslations("Menu");
  const categories = pages
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !["cover", "welcome", "thanks", "back"].includes(item.id));

  if (mode === "select") {
    return (
      <Select value={String(page)} onValueChange={(value) => onSelect(Number(value))}>
        <SelectTrigger
          aria-label={t("categories")}
          className="border-[#006B57]/30 bg-white text-[#15201C]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pages.map((item, index) => (
            <SelectItem key={item.id} value={String(index)}>
              {String(index + 1).padStart(2, "0")} · {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Navigation aria-label={t("categories")} className="block self-start">
      <List ordered className="space-y-0.5">
        {categories.map(({ item, index }) => (
          <ListItem key={item.id}>
            <Button
              variant="ghost"
              size="sm"
              aria-current={page === index ? "page" : undefined}
              onClick={() => onSelect(index)}
              className={cn(
                tabStyles.entry,
                page === index ? tabStyles.active : tabStyles.idle,
              )}
            >
              <Typography as="span" variant="caption" className="w-5 shrink-0 tabular-nums">
                {String(index + 1).padStart(2, "0")}
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
