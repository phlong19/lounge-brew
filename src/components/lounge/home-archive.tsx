import { getTranslations } from "next-intl/server";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Icon } from "@/components/ui/icon";
import { Article, Container, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";
import { Typography } from "@/components/ui/typography";
import source from "@/data/trixie-home.json";
import { cn } from "@/lib/utils";
import { surfaceStyles } from "@/lib/ui/styles";
import type { AppLocale } from "@/i18n/config";

export async function HomeArchive({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("PreservedHome");
  return <Section id="archive" data-home-section="archive" aria-labelledby="archive-heading" className="bg-white">
    <Container><Stack gap="xl">

      <Carousel label={t("archiveTitle")} columns={4} heading={<Reveal><Stack gap="sm"><Typography as="h2" variant="title" id="archive-heading">{t("archiveTitle")}</Typography><Typography variant="lead">{t("archiveDescription")}</Typography></Stack></Reveal>} action={<AppLink href="https://trixie.com.vn/album-anh.html" target="_blank" className="inline-flex min-h-11 items-center gap-3 font-medium hover:underline">{t("allAlbums")}<Icon name="arrowUpRight" /></AppLink>}>
        {source.archive.map(item => <CarouselItem key={item.id} data-source-id={item.id}><Article>
          <Surface className={cn("relative aspect-[4/3] overflow-hidden",surfaceStyles.evening)}>{item.image.src ? <Media src={item.image.src} alt={item.sourceTitle || item.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" /> : <Stack className="h-full items-center justify-center p-5 text-center"><Icon name="music" className="size-8" /><Typography variant="small">{t("unavailableAlbum")}</Typography></Stack>}</Surface>
          <Stack gap="sm" className="pt-5"><Typography as="h3" variant="subheading">{item.title}</Typography>{item.date ? <Typography as="time" dateTime={item.date} variant="small">{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(`${item.date}T12:00:00+07:00`))}</Typography> : null}</Stack>
        </Article></CarouselItem>)}
      </Carousel>
    </Stack></Container>
  </Section>;
}
