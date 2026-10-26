import { getTranslations } from "next-intl/server";

import { PhotoGallery } from "@/components/lounge/photo-gallery";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Section, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";

export async function HomeVenue() {
  const t = await getTranslations("Site");
  return (
    <Section id="venue" aria-labelledby="venue-heading" className="bg-white">
      <Container>
        <Grid className="items-end gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal><Typography as="h2" variant="title" tone="brand" id="venue-heading" className="whitespace-pre-line">{t("storyTitle")}</Typography></Reveal>
          <Reveal>
            <Stack gap="lg">
              <Typography variant="lead" className="max-w-xl">{t("storyDescription")}</Typography>
              <AppLink href="#contact" className="inline-flex min-h-11 w-fit items-center gap-3 font-medium hover:underline">{t("storyLink")}<Icon name="arrowDown" /></AppLink>
            </Stack>
          </Reveal>
        </Grid>
        <Stack gap="lg" className="mt-10 md:mt-14">
          <PhotoGallery />
          <Reveal><Typography variant="small">{t("galleryDescription")}</Typography></Reveal>
        </Stack>
      </Container>
    </Section>
  );
}
