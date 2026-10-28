import { getLocale, getTranslations } from "next-intl/server";
import { Embed } from "@/components/ui/embed";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Inline, SiteFooterFrame, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import { surfaceStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export async function SiteFooter({ compact = false }: { compact?: boolean }) {
  const [t, nav, home, locale] = await Promise.all([getTranslations("Site"),getTranslations("Navigation"),getTranslations("PreservedHome"),getLocale()]);
  return <SiteFooterFrame id={compact ? undefined : "contact"} data-home-section={compact ? undefined : "contact"} className={cn(compact ? "bg-white py-6 md:py-8" : surfaceStyles.evening)}>
    <Container>
      {!compact ? <Grid className="items-start gap-8 lg:grid-cols-[1.1fr_1fr_1fr]">
        <Stack gap="lg"><AppLink href="/" className="w-fit"><Media src="/trixie/logo.png" alt={venue.name} width={150} height={60} fit="contain" /></AppLink><Typography as="h2" variant="subheading">{venue.name}</Typography><Typography>{locale === "en" ? venue.addressEn : venue.address}</Typography><Stack gap="xs"><AppLink href={venue.phoneHref} className="w-fit text-lg font-semibold hover:underline">{venue.phone}</AppLink><AppLink href={venue.secondaryPhoneHref} className="w-fit hover:underline">{venue.secondaryPhone}</AppLink><Typography variant="small">{t("daily")}</Typography></Stack><AppLink href={venue.mapUrl} target="_blank" className="inline-flex min-h-11 w-fit items-center gap-3 hover:underline">{t("directions")}<Icon name="arrowUpRight" /></AppLink><Inline gap="lg" className="text-sm"><AppLink href={venue.youtubeUrl} target="_blank" className="hover:underline">YouTube ↗</AppLink><AppLink href={venue.pinterestUrl} target="_blank" className="hover:underline">Pinterest ↗</AppLink></Inline></Stack>
        {[{key:"cafe",title:home("cafePage"),description:home("cafeSocialNote"),href:venue.facebookUrl},{key:"lounge",title:home("loungePage"),description:home("loungeSocialNote"),href:venue.loungeFacebookUrl}].map(page => <Surface key={page.key} className="flex flex-col justify-between gap-8 bg-white/5 p-6 md:p-8" data-source-fanpage={page.key}><Stack gap="lg"><Typography as="h2" variant="subheading">{page.title}</Typography><Typography>{page.description}</Typography><Surface className="overflow-hidden rounded-md bg-white"><Embed title={`Facebook · ${page.title}`} src={`https://www.facebook.com/plugins/page.php?${new URLSearchParams({ href: page.href, tabs: "", width: "280", height: "130", small_header: "false", adapt_container_width: "true", hide_cover: "true", show_facepile: "false" })}`} width={280} height={130} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture" className="mx-auto h-[130px] w-full max-w-[280px]" /></Surface></Stack><AppLink href={page.href} target="_blank" className="inline-flex min-h-11 w-fit items-center gap-3 hover:underline">{home("openFacebook")}<Icon name="arrowUpRight" /></AppLink></Surface>)}
      </Grid> : null}
      {!compact ? <Typography variant="small" tone="inverseMuted" className="mt-6">{t("socialFallback")}</Typography> : null}
      <Inline className={cn("justify-between gap-y-5", !compact && "mt-12")} gap="lg"><Typography variant="small" tone={compact ? "muted" : "inverseMuted"}>© {new Date().getFullYear()} {t("copyright")}</Typography><Inline gap="lg" className="text-sm"><AppLink href="/menu" className="hover:underline">{nav("menu")}</AppLink><AppLink href="/events" className="hover:underline">{nav("events")}</AppLink><AppLink href="https://trixie.com.vn/video.html" className="hover:underline">{nav("video")}</AppLink><AppLink href="https://trixie.com.vn/tin-tuc.html" className="hover:underline">{nav("news")}</AppLink></Inline></Inline>
    </Container>
  </SiteFooterFrame>;
}
