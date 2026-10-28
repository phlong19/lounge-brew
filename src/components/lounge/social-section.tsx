import { getTranslations } from "next-intl/server";
import { Container, Grid, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { Embed } from "@/components/ui/embed";
import { Icon } from "@/components/ui/icon";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { socialLinks, venue } from "@/data/trixie-content";

export async function SocialSection() {
  const t = await getTranslations("Site");
  return (
    <Section id="social" aria-labelledby="social-heading" className="bg-white">
      <Container>
        <Grid className="items-start gap-8 lg:grid-cols-[1fr_2fr]">
          <Stack gap="md">
            <Typography as="h2" variant="heading" id="social-heading">{t("socialTitle")}</Typography>
            <Typography tone="muted">{t("socialDescription")}</Typography>
            <Inline gap="sm">
              {socialLinks.map((link) => (
                <AppLink key={link.id} href={link.href} target="_blank" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium hover:underline">
                  {link.label}<Icon name="arrowUpRight" className="size-4" />
                </AppLink>
              ))}
            </Inline>
          </Stack>
          <Grid className="justify-items-center gap-6 sm:grid-cols-2">
            {[{ label: "Trixie Café", href: venue.facebookUrl }, { label: "Trixie Lounge", href: venue.loungeFacebookUrl }].map((page) => (
              <Stack key={page.href} gap="sm" className="w-full max-w-[280px]">
                <AppLink href={page.href} target="_blank" className="inline-flex min-h-11 items-center justify-between font-medium hover:underline">
                  {page.label}<Icon name="arrowUpRight" className="size-4" />
                </AppLink>
                <Surface className="overflow-hidden rounded-md border border-stone-200 bg-stone-50">
                  <Embed
                    title={`Facebook · ${page.label}`}
                    src={`https://www.facebook.com/plugins/page.php?${new URLSearchParams({ href: page.href, tabs: "", width: "280", height: "130", small_header: "false", adapt_container_width: "true", hide_cover: "true", show_facepile: "false" })}`}
                    width={280}
                    height={130}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="encrypted-media; picture-in-picture"
                    className="mx-auto h-[130px] w-[280px]"
                  />
                </Surface>
              </Stack>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
}
