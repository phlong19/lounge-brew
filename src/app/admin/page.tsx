import { getTranslations } from "next-intl/server";

import { BilingualFieldPair } from "@/components/admin/bilingual-field";
import { Button } from "@/components/ui/button";
import { Grid, Inline, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Typography } from "@/components/ui/typography";

export default async function AdminPage() {
  const t = await getTranslations("Admin");
  return (
    <Stack gap="xl">
      <AppLink href="/" className="w-fit hover:underline">
        ← {t("backToSite")}
      </AppLink>
      <Inline className="items-end justify-between">
        <Stack>
          <Typography as="h1" variant="title" tone="brand">
            {t("title")}
          </Typography>
          <Typography tone="muted">{t("description")}</Typography>
        </Stack>
        <Inline>
          <Button disabled variant="outline">
            {t("saveDraft")}
          </Button>
          <Button disabled>{t("publish")}</Button>
        </Inline>
      </Inline>
      <Grid className="items-start lg:grid-cols-2">
        {[
          { title: t("categories"), vi: "Cà phê", en: "Coffee" },
          { title: t("menuItems"), vi: "Thực đơn Trixie", en: "Trixie menu" },
          { title: t("events"), vi: "Lịch diễn", en: "Live programme" },
          {
            title: t("articles"),
            vi: "Chuyện ở Trixie",
            en: "Stories from Trixie",
          },
        ].map((item) => (
          <Surface key={item.title} tone="white" className="rounded-lg p-6">
            <Stack gap="lg">
              <Typography as="h2" variant="subheading">
                {item.title}
              </Typography>
              <BilingualFieldPair
                legend={t("descriptions")}
                vietnameseLabel={t("vietnamese")}
                englishLabel={t("english")}
                vietnameseValue={item.vi}
                englishValue={item.en}
              />
            </Stack>
          </Surface>
        ))}
      </Grid>
      <Typography variant="small" tone="muted">
        {t("readOnlyNotice")}
      </Typography>
    </Stack>
  );
}
