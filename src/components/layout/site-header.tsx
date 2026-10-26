import { getTranslations } from "next-intl/server";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Container,
  Inline,
  Navigation,
  SiteHeaderFrame,
  Surface,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import { cn } from "@/lib/utils";

type Props = { active?: "home" | "menu" | "events" | "journal" | "admin" };

export async function SiteHeader({ active }: Props) {
  const [t, site] = await Promise.all([
    getTranslations("Navigation"),
    getTranslations("Site"),
  ]);
  const items = [
    { href: "/menu", key: "menu", label: t("menu") },
    { href: "/events", key: "events", label: t("events") },
    { href: "/#venue", key: "venue", label: t("venue") },
    { href: "/journal", key: "journal", label: t("journal") },
  ];
  return (
    <SiteHeaderFrame className="bg-white">
      <AppLink
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-32 rounded-md bg-white px-5 py-3 focus:translate-y-0"
      >
        {site("skip")}
      </AppLink>
      <Surface tone="paper" className="hidden sm:block">
        <Container className="flex min-h-9 items-center justify-between gap-4">
          <AppLink
            href={venue.mapUrl}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm hover:underline"
          >
            <Icon name="mapPin" className="size-3.5" />
            {site("location")}
          </AppLink>
          <Typography variant="small" tone="muted">
            {site("daily")}
          </Typography>
        </Container>
      </Surface>
      <Container className="flex h-20 items-center justify-between gap-5 lg:h-24">
        <AppLink href="/" aria-label="Trixie · Home" className="shrink-0">
          <Media
            src="/trixie/logo.png"
            alt="Trixie Café & Lounge"
            width={150}
            height={60}
            priority
            fit="contain"
            className="h-12 w-32 lg:h-14 lg:w-36"
          />
        </AppLink>
        <Navigation aria-label={t("home")} className="hidden gap-7 lg:flex">
          {items.map((item) => (
            <AppLink
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={cn(
                "py-3 text-sm font-medium transition-colors hover:text-emerald-800",
                active === item.key &&
                  "text-emerald-800 underline decoration-2 underline-offset-8",
              )}
            >
              {item.label}
            </AppLink>
          ))}
        </Navigation>
        <Inline gap="sm" className="flex-nowrap">
          <Surface className="hidden md:block">
            <LocaleSwitcher />
          </Surface>
          <Button asChild className="hidden sm:inline-flex">
            <AppLink href={venue.phoneHref}>
              {t("book")}
              <Icon name="arrowUpRight" className="size-4" />
            </AppLink>
          </Button>
          <MobileNavigation
            items={items}
            active={active}
            title={t("brand")}
            openLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
            bookingLabel={t("book")}
          />
        </Inline>
      </Container>
    </SiteHeaderFrame>
  );
}
