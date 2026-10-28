import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Container, Main, Section, Stack } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";

export default async function NotFound() {
  const t = await getTranslations("Common");
  return (
    <>
      <SiteHeader />
      <Main id="main-content">
        <Section>
          <Container>
            <Stack
              gap="lg"
              className="min-h-[45dvh] items-start justify-center"
            >
              <Typography variant="caption" tone="muted">
                404
              </Typography>
              <Typography as="h1" variant="title" tone="brand">
                {t("notFound")}
              </Typography>
              <Button asChild>
                <AppLink href="/">{t("backHome")}</AppLink>
              </Button>
            </Stack>
          </Container>
        </Section>
      </Main>
      <SiteFooter />
    </>
  );
}
