import { getTranslations } from "next-intl/server";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationGroup } from "@/components/layout/navigation-group";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Inline, Navigation, SiteHeaderFrame, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import type { NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

type Props = { active?: "home" | "menu" | "events" | "journal" | "admin" };

export async function SiteHeader({ active }: Props) {
  const [t, site] = await Promise.all([getTranslations("Navigation"), getTranslations("Site")]);
  const items: NavigationItem[] = [
    { key:"home", href:"/", label:t("home") },
    { key:"menu", href:"/menu", label:t("menu") },
    { key:"services", href:"/#introduction", label:t("services"), children:[
      {key:"musicLounge",label:t("musicLounge"),href:"https://trixie.com.vn/phong-tra-ha-noi.html"},
      {key:"privateEvents",label:t("privateEvents"),href:"https://trixie.com.vn/to-chuc-su-kien.html"},
    ]},
    { key:"events", href:"/events", label:t("events"), children:[
      {key:"minishows",label:t("minishows"),href:"/events"},
      {key:"offers",label:t("offers"),href:"https://trixie.com.vn/uu-dai.html"},
    ]},
    { key:"albums", href:"https://trixie.com.vn/album-anh.html", label:t("albums") },
    { key:"video", href:"https://trixie.com.vn/video.html", label:t("video") },
    { key:"contact", href:"https://trixie.com.vn/lien-he.html", label:t("contact") },
    { key:"news", href:"https://trixie.com.vn/tin-tuc.html", label:t("news") },
  ];
  return <SiteHeaderFrame className="bg-white" data-source-navigation="preserved">
    <AppLink href="#main-content" className="fixed top-3 left-3 z-50 -translate-y-32 rounded-md bg-white px-5 py-3 focus:translate-y-0">{site("skip")}</AppLink>
    <Surface tone="paper" className="hidden sm:block"><Container className="flex min-h-9 items-center justify-between gap-4"><AppLink href={venue.mapUrl} target="_blank" className="inline-flex items-center gap-2 text-sm hover:underline"><Icon name="mapPin" className="size-3.5" />{site("location")}</AppLink><Typography variant="small" tone="muted">{site("daily")}</Typography></Container></Surface>
    <Container className="flex h-20 items-center justify-between gap-4 xl:h-24">
      <AppLink href="/" aria-label="Trixie · Home" className="shrink-0"><Media src="/trixie/logo.png" alt="Trixie Café & Lounge" width={150} height={60} priority fit="contain" className="h-12 w-28 xl:h-14 xl:w-32" /></AppLink>
      <Navigation aria-label={t("home")} className="hidden gap-3 xl:flex">{items.map(item => item.children ? <NavigationGroup key={item.key} item={item} /> : <AppLink key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} className={cn("inline-flex min-h-11 items-center py-2 text-sm font-medium hover:underline",active === item.key && "underline decoration-2 underline-offset-8")}>{item.label}</AppLink>)}</Navigation>
      <Inline gap="xs" className="flex-nowrap"><Surface className="hidden md:block"><LocaleSwitcher /></Surface><Button asChild className="hidden sm:inline-flex"><AppLink href="/#reservation">{t("book")}<Icon name="arrowUpRight" className="size-4" /></AppLink></Button><MobileNavigation items={items} active={active} title={t("brand")} openLabel={t("openMenu")} closeLabel={t("closeMenu")} bookingLabel={t("book")} /></Inline>
    </Container>
  </SiteHeaderFrame>;
}
