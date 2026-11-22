import { getTranslations } from "next-intl/server";

import { Container, Inline, Navigation, SiteFooterFrame, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import { footerStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

export async function EventFooter() {
  const [nav, site] = await Promise.all([
    getTranslations("Navigation"),
    getTranslations("Site"),
  ]);

  return (
    <SiteFooterFrame className={cn(footerStyles.frame, "border-t border-stone-200 py-6 md:py-8")}>
      <Container>
        <Stack gap="sm">
          <Inline className="justify-between gap-y-2">
            <AppLink href="/" className="inline-flex min-h-11 items-center">
              <Media src="/trixie/logo.png" alt={venue.name} width={112} height={44} fit="contain" />
            </AppLink>
            <Navigation aria-label={nav("events")} className="flex-wrap gap-x-5 gap-y-0 text-sm">
              <AppLink href="/events" className={footerStyles.navLink}>{nav("events")}</AppLink>
              <AppLink href="/menu" className={footerStyles.navLink}>{nav("menu")}</AppLink>
              <AppLink href="/journal" className={footerStyles.navLink}>{nav("journal")}</AppLink>
              <AppLink href="/events#contact" className={footerStyles.navLink}>{nav("contact")}</AppLink>
            </Navigation>
          </Inline>
          <Typography variant="small" tone="muted" className="border-t border-stone-200 pt-3">
            © {new Date().getFullYear()} {site("copyright")}
          </Typography>
        </Stack>
      </Container>
    </SiteFooterFrame>
  );
}
