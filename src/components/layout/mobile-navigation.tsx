"use client";

import { useState } from "react";

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
import { venue } from "@/data/trixie-content";

type Props = {
  items: { href: string; key: string; label: string }[];
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
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={openLabel}
          className="lg:hidden"
        >
          <Icon name="menu" />
        </Button>
      </SheetTrigger>
      <SheetContent closeLabel={closeLabel}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{venue.address}</SheetDescription>
        </SheetHeader>
        <Navigation
          aria-label={openLabel}
          className="flex-col items-stretch gap-1 py-5"
        >
          {items.map((item) => (
            <AppLink
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center justify-between py-3 text-xl font-medium hover:underline"
            >
              {item.label}
              <Icon name="arrowUpRight" />
            </AppLink>
          ))}
        </Navigation>
        <Stack className="mt-auto pb-[env(safe-area-inset-bottom)]">
          <LocaleSwitcher />
          <Button asChild size="lg">
            <AppLink href={venue.phoneHref}>
              <Icon name="phone" />
              {bookingLabel}
            </AppLink>
          </Button>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
