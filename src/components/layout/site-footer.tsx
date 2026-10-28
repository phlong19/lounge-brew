import { getLocale, getTranslations } from "next-intl/server";
import { Embed } from "@/components/ui/embed";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Inline, SiteFooterFrame, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import { footerStyles, socialIconStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

export async function SiteFooter({ compact = false }: { compact?: boolean }) {
  const [t, nav, home, locale] = await Promise.all([getTranslations("Site"), getTranslations("Navigation"), getTranslations("PreservedHome"), getLocale()]);
  return <SiteFooterFrame id={compact ? undefined : "contact"} data-home-section={compact ? undefined : "contact"} className={cn(footerStyles.frame, compact && "pt-6 md:pt-8")}>
    <Container>
      {!compact ? <Grid className="items-start gap-10 md:grid-cols-2 lg:grid-cols-[1fr_1.15fr_1fr]">
        <Stack gap="lg">
          <AppLink href="/" className="w-fit"><Media src="/trixie/logo.png" alt={venue.name} width={150} height={60} fit="contain" /></AppLink>
          <Typography as="h2" variant="subheading">{venue.name}</Typography>
          <Stack gap="sm">
            <Inline className="flex-nowrap items-start" gap="sm"><Icon name="mapPin" className="mt-1" /><Typography>{locale === "en" ? venue.addressEn : venue.address}</Typography></Inline>
            <Inline gap="xs" className="flex-nowrap" data-contact-phones><Icon name="phone" /><AppLink href={venue.phoneHref} className={cn(footerStyles.contactLink, "whitespace-nowrap font-semibold")}>{venue.phone}</AppLink><Typography as="span" aria-hidden="true">-</Typography><AppLink href={venue.secondaryPhoneHref} className={cn(footerStyles.contactLink, "whitespace-nowrap")}>{venue.secondaryPhone}</AppLink></Inline>
            <Inline gap="sm" className="flex-nowrap"><Icon name="clock" /><Typography variant="small">{t("daily")}</Typography></Inline>
          </Stack>
          <Inline gap="lg"><AppLink href={venue.youtubeUrl} target="_blank" className={footerStyles.contactLink}><Icon name="youtube" className={socialIconStyles.youtube} />YouTube</AppLink><AppLink href={venue.instagramUrl} target="_blank" className={footerStyles.contactLink}><Icon name="instagram" className={socialIconStyles.instagram} />Instagram</AppLink><AppLink href={venue.pinterestUrl} target="_blank" className={footerStyles.contactLink}><Icon name="pinterest" className={socialIconStyles.pinterest} />Pinterest</AppLink></Inline>
        </Stack>
        <Stack gap="md">
          <Typography as="h2" variant="subheading">{t("mapTitle")}</Typography>
          <Surface className="overflow-hidden rounded-md"><Embed title={t("mapTitle")} src={venue.mapEmbedUrl} width={600} height={340} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" className="h-[300px] w-full lg:h-[340px]" /></Surface>
        </Stack>
        <Stack gap="lg" className="md:col-span-2 md:grid md:grid-cols-2 lg:col-span-1 lg:flex">
          {[{ key: "cafe", title: home("cafePage"), href: venue.facebookUrl }, { key: "lounge", title: home("loungePage"), href: venue.loungeFacebookUrl }].map(page => <Stack key={page.key} gap="sm" data-source-fanpage={page.key}>
            <Typography as="h2" variant="subheading" className="flex items-center gap-2 text-lg md:text-xl"><Icon name="facebook" className={socialIconStyles.facebook} />Fanpage {page.title}</Typography>
            <Embed title={`Fanpage ${page.title}`} src={`https://www.facebook.com/plugins/page.php?${new URLSearchParams({ href: page.href, tabs: "", width: "340", height: "150", small_header: "false", adapt_container_width: "true", hide_cover: "true", show_facepile: "false" })}`} width={340} height={150} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" className="h-[150px] w-full max-w-[340px]" />

          </Stack>)}
        </Stack>
      </Grid> : null}
      <Inline className={cn("justify-between gap-y-2", !compact && "mt-8")} gap="lg">
        <Typography variant="small" tone="muted">© {new Date().getFullYear()} {t("copyright")}</Typography>
        <Inline gap="lg" className="text-sm"><AppLink href="/menu" className={footerStyles.navLink}>{nav("menu")}</AppLink><AppLink href="/events" className={footerStyles.navLink}>{nav("events")}</AppLink><AppLink href="https://trixie.com.vn/video.html" className={footerStyles.navLink}>{nav("video")}</AppLink><AppLink href="https://trixie.com.vn/tin-tuc.html" className={footerStyles.navLink}>{nav("news")}</AppLink></Inline>
      </Inline>
    </Container>
  </SiteFooterFrame>;
}
