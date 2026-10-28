import { getTranslations } from "next-intl/server";
import { Embed } from "@/components/ui/embed";
import { Article, Container, Section, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import { homeVideo } from "@/data/home-video";
import { videoStyles } from "@/lib/ui/home-styles";

export async function HomeVideo() {
  const t = await getTranslations("PreservedHome");
  return <Section id="booking" data-home-section="booking" aria-labelledby="video-heading" className={videoStyles.section}>
    <Container><Article id="video" data-home-section="video" className={videoStyles.frame}>
      <Stack gap="md"><Typography as="h2" variant="heading" id="video-heading">{t("videoTitle")}</Typography>
        <Embed title={homeVideo.title} src={`https://www.youtube-nocookie.com/embed/${homeVideo.id}?rel=0&playsinline=1`} width={720} height={405} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className={videoStyles.player} />
      </Stack>
    </Article></Container>
  </Section>;
}
