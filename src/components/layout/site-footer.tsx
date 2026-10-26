import { getTranslations } from "next-intl/server";

import {
  Container,
  Grid,
  Inline,
  SiteFooterFrame,
  Stack,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { socialLinks, venue } from "@/data/trixie-content";

export async function SiteFooter() {
  const [t, nav] = await Promise.all([
    getTranslations("Site"),
    getTranslations("Navigation"),
  ]);
  return (
    <SiteFooterFrame className="bg-white">
      <Container>
        <Grid className="gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <Stack gap="sm">
            <AppLink href="/" className="w-fit">
              <Media
                src="/trixie/logo.png"
                alt="Trixie Café & Lounge"
                width={150}
                height={60}
                fit="contain"
              />
            </AppLink>
            <Typography variant="small" tone="muted">
              {t("footerNote")}
            </Typography>
          </Stack>
          <Stack gap="sm">
            <Typography variant="caption">{t("address")}</Typography>
            <Typography variant="small" tone="muted">
              {venue.address}
            </Typography>
            <AppLink
              href={venue.mapUrl}
              target="_blank"
              className="w-fit text-sm hover:underline"
            >
              {t("directions")} ↗
            </AppLink>
          </Stack>
          <Stack gap="sm">
            <Typography variant="caption">{t("hotline")}</Typography>
            <AppLink
              href={venue.phoneHref}
              className="w-fit text-lg font-semibold hover:underline"
            >
              {venue.phone}
            </AppLink>
            <Typography variant="small" tone="muted">
              {t("daily")}
            </Typography>
          </Stack>
        </Grid>
        <Inline className="mt-12 justify-between gap-y-5" gap="lg">
          <Typography variant="small" tone="muted">
            © {new Date().getFullYear()} {t("copyright")}
          </Typography>
          <Inline gap="lg" className="text-sm">
            <AppLink href="/menu" className="hover:underline">
              {nav("menu")}
            </AppLink>
            <AppLink href="/events" className="hover:underline">
              {nav("events")}
            </AppLink>
            {socialLinks.map((link) => (
              <AppLink key={link.id} href={link.href} target="_blank" className="inline-flex min-h-11 items-center hover:underline">
                {link.label} ↗
              </AppLink>
            ))}
          </Inline>
        </Inline>
      </Container>
    </SiteFooterFrame>
  );
}
