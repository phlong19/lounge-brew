import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Container,
  Main,
  Section,
  Stack,
  Status,
} from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("Admin");
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return (
        <Main id="main-content">
          <Section>
            <Container className="max-w-2xl">
              <Stack gap="lg">
                <Typography as="h1" variant="title" tone="brand">
                  {t("title")}
                </Typography>
                <Typography>{t("authRequired")}</Typography>
                <Button asChild className="w-fit">
                  <AppLink href="/">{t("backToSite")}</AppLink>
                </Button>
              </Stack>
            </Container>
          </Section>
        </Main>
      );
  }
  return (
    <Main id="main-content">
      <Section>
        <Container>
          {!supabase ? (
            <Status className="mb-8 rounded-md bg-amber-100 p-4 text-amber-950">
              {t("previewMode")}
            </Status>
          ) : null}
          {children}
        </Container>
      </Section>
    </Main>
  );
}
