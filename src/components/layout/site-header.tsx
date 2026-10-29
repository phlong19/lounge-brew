import { getTranslations } from "next-intl/server";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationGroup } from "@/components/layout/navigation-group";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ReservationButton } from "@/components/lounge/reservation-provider";
import { ReservationDialogData } from "@/components/lounge/reservation-dialog-data";
import { Icon } from "@/components/ui/icon";
import { Container, Inline, Navigation, SiteHeaderFrame, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import type { NavigationItem } from "@/types/navigation";
import { headerStyles } from "@/lib/ui/home-styles";

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
  return <>
    <Surface tone="paper" data-announcement-bar>
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-0 py-1 md:py-0">
        <Inline gap="md"><Inline gap="xs"><Icon name="mapPin" className="size-4" /><Typography variant="small">{site("location")}</Typography></Inline><AppLink href={venue.mapUrl} target="_blank" className={headerStyles.announcementLink}>{site("viewMap")}<Icon name="arrowUpRight" className="size-3.5" /></AppLink></Inline>
        <Inline gap="lg"><Inline gap="xs" className="flex-nowrap"><Icon name="phone" className="size-4" /><AppLink href={venue.phoneHref} className={headerStyles.announcementLink}>{venue.phone}</AppLink><Typography as="span" variant="small" aria-hidden="true">-</Typography><AppLink href={venue.secondaryPhoneHref} className={headerStyles.announcementLink}>{venue.secondaryPhone}</AppLink></Inline><Typography variant="small" tone="muted" className="hidden md:block">{site("daily")}</Typography></Inline>
      </Container>
    </Surface>
    <SiteHeaderFrame className="sticky top-0 bg-white" data-source-navigation="preserved">
    <AppLink href="#main-content" className="fixed top-3 left-3 z-50 -translate-y-32 rounded-md bg-white px-5 py-3 focus:translate-y-0">{site("skip")}</AppLink>

    <Container className="flex h-20 items-center justify-between gap-4 xl:h-24">
      <AppLink href="/" aria-label="Trixie · Home" className="shrink-0"><Media src="/trixie/logo.png" alt="Trixie Café & Lounge" width={150} height={60} priority fit="contain" className="h-12 w-28 xl:h-14 xl:w-32" /></AppLink>
      <Navigation aria-label={t("home")} className="hidden gap-6 xl:flex">{items.map(item => item.children ? <NavigationGroup key={item.key} item={item} active={active === item.key} /> : <AppLink key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} className={headerStyles.navLink}>{item.label}</AppLink>)}</Navigation>
      <Inline gap="sm" className="flex-nowrap md:gap-6"><Surface className="hidden md:block"><LocaleSwitcher /></Surface><ReservationButton data-reservation-focus-fallback className="hidden hover:bg-[#006B57] hover:text-white sm:inline-flex">{t("book")}<Icon name="arrowUpRight" className="size-4" /></ReservationButton><MobileNavigation items={items} active={active} title={t("brand")} openLabel={t("openMenu")} closeLabel={t("closeMenu")} bookingLabel={t("book")} /></Inline>
    </Container>
  </SiteHeaderFrame><ReservationDialogData /></>;
}
