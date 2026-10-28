import { getLocale, getTranslations } from "next-intl/server";
import { ReservationButton } from "@/components/lounge/reservation-provider";
import { Icon } from "@/components/ui/icon";
import { Container, Grid, Inline, Section, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { venue } from "@/data/trixie-content";
import { surfaceStyles } from "@/lib/ui/styles";

export async function VisitSection() {
  const [t, nav, locale] = await Promise.all([getTranslations("Site"), getTranslations("Navigation"), getLocale()]);
  return <Section id="contact" aria-labelledby="visit-heading" className={surfaceStyles.brand}>
    <Container><Grid className="items-start gap-12 lg:grid-cols-2 lg:gap-24">
      <Stack gap="lg">
        <Typography as="h2" variant="display" id="visit-heading" className="whitespace-pre-line">{t("visitTitle")}</Typography>
        <Typography variant="lead" className="max-w-lg">{t("visitDescription")}</Typography>
        <Inline><ReservationButton variant="secondary" size="lg">{nav("book")}<Icon name="arrowUpRight" /></ReservationButton><AppLink href={venue.phoneHref} className="inline-flex min-h-12 items-center gap-2 hover:underline"><Icon name="phone" />{venue.phone}</AppLink></Inline>
      </Stack>
      <Stack gap="xl">
        <Grid className="gap-8 sm:grid-cols-2">
          <Stack gap="sm"><Typography variant="caption">{t("address")}</Typography><Typography>{locale === "en" ? venue.addressEn : venue.address}</Typography><AppLink href={venue.mapUrl} target="_blank" className="inline-flex min-h-11 items-center gap-2 hover:underline">{t("directions")}<Icon name="arrowUpRight" /></AppLink></Stack>
          <Stack gap="sm"><Typography variant="caption">{t("hours")}</Typography><Typography>{venue.hours}</Typography><AppLink href={venue.secondaryPhoneHref} className="inline-flex min-h-11 items-center gap-2 hover:underline"><Icon name="phone" />{venue.secondaryPhone}</AppLink></Stack>
        </Grid>
        <Stack gap="sm"><Typography as="h3" variant="subheading">{t("privateEvents")}</Typography><Typography>{t("privateDescription")}</Typography><AppLink href={venue.loungeFacebookUrl} target="_blank" className="inline-flex min-h-11 w-fit items-center gap-2 hover:underline">Facebook · Trixie Lounge<Icon name="arrowUpRight" className="size-4" /></AppLink></Stack>
      </Stack>
    </Grid></Container>
  </Section>;
}
