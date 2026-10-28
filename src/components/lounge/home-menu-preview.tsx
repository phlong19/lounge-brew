import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Inline, Section, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import { surfaceStyles } from "@/lib/ui/styles";

export async function HomeMenuPreview() {
  const t = await getTranslations("Site");
  return (
    <Section aria-labelledby="menu-preview-heading" className={surfaceStyles.stone}>
      <Container>
        <Grid className="items-center gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Reveal>
            <Stack gap="lg">
              <Typography as="h2" variant="title" id="menu-preview-heading">{t("menuTitle")}</Typography>
              <Typography variant="lead" className="max-w-md">{t("menuDescription")}</Typography>
              <Button asChild variant="primary" size="lg" className="w-fit"><AppLink href="/menu">{t("openMenu")}<Icon name="arrowUpRight" /></AppLink></Button>
            </Stack>
          </Reveal>
          <Reveal>
            <Stack gap="lg">
              <AppLink href="/menu?page=3" aria-label={t("openMenu")} className="grid grid-cols-2 overflow-hidden">
                <Media src="/menu/page-02.webp" alt={t("menuCoverAlt")} width={1211} height={1683} sizes="(min-width:1024px) 32vw, 50vw" fit="contain" className="h-auto w-full" />
                <Media src="/menu/page-03.webp" alt={t("menuAlt")} width={1211} height={1683} sizes="(min-width:1024px) 32vw, 50vw" fit="contain" className="h-auto w-full" />
              </AppLink>
              <Inline className="justify-end" gap="sm">
                <AppLink href="/menu?page=3" className="inline-flex min-h-11 items-center gap-3 text-sm hover:underline">{t("browsePages")}<Icon name="arrowRight" className="size-4" /></AppLink>
              </Inline>
            </Stack>
          </Reveal>
        </Grid>
      </Container>
    </Section>
  );
}
