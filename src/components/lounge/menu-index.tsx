"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Inline,
  List,
  ListItem,
  Navigation,
  Stack,
} from "@/components/ui/layout";
import { Media } from "@/components/ui/media";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { MenuPage } from "@/types/domain";

const indexStyles = {
  active: "border-[#A18B47] bg-[#FFFAE7]/10 text-[#FFFAE7]",
  idle: "border-transparent text-stone-300 hover:bg-[#FFFAE7]/5 hover:text-[#FFFAE7]",
  entry:
    "w-full justify-start gap-3 rounded-none border-l-2 px-3 text-left whitespace-normal",
  thumbnail:
    "relative h-auto w-16 shrink-0 flex-col gap-1 rounded-none border-2 p-1",
} as const;

export function MenuIndex({
  pages,
  page,
  onSelect,
}: {
  pages: MenuPage[];
  page: number;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("Menu");
  return (
    <Stack gap="sm">
      <Typography
        as="h2"
        variant="caption"
        className="uppercase tracking-widest text-[#C6B573]"
      >
        {t("categories")}
      </Typography>
      <Stack className="lg:hidden">
        <Select
          value={String(page)}
          onValueChange={(value) => onSelect(Number(value))}
        >
          <SelectTrigger aria-label={t("categories")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pages.map((item, index) => (
              <SelectItem key={item.id} value={String(index)}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Stack>
      <Navigation
        aria-label={t("categories")}
        className="hidden max-h-[680px] overflow-y-auto lg:block"
      >
        <List className="space-y-0.5">
          {pages.map((item, index) => (
            <ListItem key={item.id}>
              <Button
                variant="ghost"
                size="sm"
                aria-current={page === index ? "page" : undefined}
                onClick={() => onSelect(index)}
                className={cn(
                  indexStyles.entry,
                  page === index ? indexStyles.active : indexStyles.idle,
                )}
              >
                <Typography
                  as="span"
                  variant="caption"
                  className="w-5 shrink-0 text-[#C6B573]"
                >
                  {String(index + 1).padStart(2, "0")}
                </Typography>
                <Typography as="span" variant="small">
                  {item.label}
                </Typography>
              </Button>
            </ListItem>
          ))}
        </List>
      </Navigation>
    </Stack>
  );
}

export function MenuThumbnails({
  pages,
  page,
  visible,
  onSelect,
}: {
  pages: MenuPage[];
  page: number;
  visible: number[];
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("Menu");
  return (
    <Navigation
      aria-label={t("pageNavigation")}
      className="w-full overflow-x-auto py-2"
    >
      <Inline gap="xs" className="flex-nowrap">
        {pages.map((item, index) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onSelect(index)}
            aria-label={`${t("page", { current: index + 1, total: pages.length })} · ${item.label}`}
            aria-current={page === index ? "page" : undefined}
            className={cn(
              indexStyles.thumbnail,
              visible.includes(index) ? indexStyles.active : indexStyles.idle,
            )}
          >
            <Media
              src={item.image}
              alt=""
              width={48}
              height={68}
              sizes="48px"
              fit="contain"
              className="h-[68px] w-12"
            />
            <Typography as="span" variant="caption">
              {index + 1}
            </Typography>
          </Button>
        ))}
      </Inline>
    </Navigation>
  );
}
