"use client";

import { useState } from "react";

import { useReservation } from "@/components/lounge/reservation-provider";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Navigation, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavigationItem } from "@/types/navigation";
import { venue } from "@/data/trixie-content";

type Props = {
  items: NavigationItem[];
  active?: string;
  title: string;
  openLabel: string;
  closeLabel: string;
  bookingLabel: string;
};

export function MobileNavigation({
  items,
  active,
  title,
  openLabel,
  closeLabel,
  bookingLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const { openReservation } = useReservation();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-reservation-focus-fallback
          aria-label={openLabel}
          className="xl:hidden"
        >
          <Icon name="menu" />
        </Button>
      </SheetTrigger>
      <SheetContent closeLabel={closeLabel} className="overflow-y-auto" onEscapeKeyDown={event => { if ((event.target as HTMLElement).closest("[data-language-switcher]")?.querySelector("[data-language-options]")) event.preventDefault(); }}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{venue.address}</SheetDescription>
        </SheetHeader>
        <Navigation
          aria-label={openLabel}
          className="flex-col items-stretch gap-1 py-5"
        >
          {items.map((item) => (
            <Stack key={item.key} gap="xs"><AppLink
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center justify-between py-3 text-xl font-medium hover:underline"
            >
              {item.label}
              <Icon name="arrowUpRight" />
            </AppLink>
            {item.children?.map(child => <AppLink key={child.key} href={child.href} onClick={() => setOpen(false)} className="min-h-11 py-2 pl-5 text-base hover:underline">{child.label}</AppLink>)}
            </Stack>
          ))}
        </Navigation>
        <Stack className="mt-auto pb-[env(safe-area-inset-bottom)]">
          <LocaleSwitcher side="top" />
          <Button size="lg" aria-haspopup="dialog" onClick={() => {
            setOpen(false);
            requestAnimationFrame(() => openReservation());
          }}>
            <Icon name="calendar" />{bookingLabel}
          </Button>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
