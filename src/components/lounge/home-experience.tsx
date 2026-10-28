import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { homeStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

export async function HomeExperience() {
  const t = await getTranslations("Experience");
  return (
    <Section aria-labelledby="experience-heading" className="bg-white">
      <Container>
        <Grid className="items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal><Typography as="h2" variant="title" tone="brand" id="experience-heading" className="max-w-sm">{t("title")}</Typography></Reveal>
          <Reveal><Stack gap="lg">
            <Typography variant="lead" className="max-w-xl">{t("description")}</Typography>
            <Inline gap="lg">
              <AppLink href="/menu" className="inline-flex min-h-11 items-center gap-3 font-medium hover:underline">{t("menu")}<Icon name="arrowUpRight" /></AppLink>
              <AppLink href="#contact" className="inline-flex min-h-11 items-center gap-3 font-medium hover:underline">{t("visit")}<Icon name="arrowDown" /></AppLink>
            </Inline>
          </Stack></Reveal>
        </Grid>
        <Grid className="mt-10 gap-6 md:mt-16 md:grid-cols-[1.15fr_0.85fr] md:items-end">
          <Reveal><AppLink href="/menu" className={cn(homeStyles.photoLink, "aspect-[5/4] md:aspect-[6/5]")}>
            <Media src="/trixie/drink-1.jpg" alt={t("dayAlt")} fill sizes="(min-width:768px) 55vw, 100vw" className={homeStyles.photo} />
            <Surface aria-hidden="true" className={homeStyles.photoScrim} />
            <Surface className={homeStyles.photoCaption}>
              <Stack gap="xs"><Typography as="h3" variant="subheading">{t("dayTitle")}</Typography><Typography>{t("dayNote")}</Typography></Stack>
              <Icon name="arrowUpRight" className="size-7" />
            </Surface>
          </AppLink></Reveal>
          <Reveal><AppLink href="/events" className={cn(homeStyles.photoLink, "aspect-[5/4] md:aspect-[4/5]")}>
            <Media src="/trixie/gallery-2.jpg" alt={t("nightAlt")} fill sizes="(min-width:768px) 40vw, 100vw" className={homeStyles.photo} />
            <Surface aria-hidden="true" className={homeStyles.photoScrim} />
            <Surface className={homeStyles.photoCaption}>
              <Stack gap="xs"><Typography as="h3" variant="subheading">{t("nightTitle")}</Typography><Typography>{t("nightNote")}</Typography></Stack>
              <Icon name="arrowUpRight" className="size-7" />
            </Surface>
          </AppLink></Reveal>
        </Grid>
      </Container>
    </Section>
  );
}
