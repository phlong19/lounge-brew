"use client";

import { ReservationButton } from "@/components/lounge/reservation-provider";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Inline, Section, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import { Media } from "@/components/ui/media";
import { Typography } from "@/components/ui/typography";
import { heroStyles, progressStyles } from "@/lib/ui/home-styles";
import { cn } from "@/lib/utils";

const slides = [
  { key: "music", image: "/trixie/stage.jpg", crop: "object-[60%_center]" },
  { key: "cafe", image: "/trixie/venue-1.jpg", crop: "object-[65%_center]" },
  { key: "gather", image: "/trixie/venue-3.jpg", crop: "object-center" },
] as const;

export function HeroCarousel() {
  const t = useTranslations("Hero");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [progress, setProgress] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPlaying(!media.matches);
    setReady(true);
    const update = () => { if (media.matches) setPlaying(false); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!playing || hovered) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      elapsed.current += 1;
      if (elapsed.current >= 20) {
        elapsed.current = 0;
        setActive(value => (value + 1) % slides.length);
      }
      setProgress(elapsed.current);
    }, 350);
    return () => window.clearInterval(timer);
  }, [playing, hovered]);

  function select(index: number) {
    const next = (index + slides.length) % slides.length;
    setActive(next);
    elapsed.current = 0;
    setProgress(0);
    setAnnouncement(t("slideAnnouncement", { name: t(slides[next].key), current: next + 1, total: slides.length }));
  }

  return (
    <Section id="hero" data-home-section="hero"
      data-ready={ready}
      aria-label={t("label")}
      aria-roledescription={t("carousel")}
      className={heroStyles.frame}
      onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={event => { if ((event.target as HTMLElement).matches(":focus-visible")) setPlaying(false); }}
      onKeyDown={event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          setPlaying(false);
          select(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
    >
      {slides.map((slide, index) => (
        <Surface key={slide.key} aria-hidden="true" className={cn(heroStyles.image, index === active ? "opacity-100" : "opacity-0")}>
          <Media src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className={slide.crop} />
        </Surface>
      ))}
      <Surface aria-hidden="true" className={heroStyles.scrim} />
      <Container className={heroStyles.content}>
        <Stack gap="lg" className="relative max-w-3xl translate-y-12 md:translate-y-24">
          <Stack gap="sm">
            <Typography as="h1" variant="title">Café & Lounge</Typography>
          </Stack>
          <Typography variant="lead" className="max-w-lg text-lg md:text-xl">
            {t(`${slides[active].key}Description`)}
          </Typography>
          <Inline gap="sm" className="pt-2">
            <ReservationButton variant="secondary" size="lg">{t("book")}<Icon name="arrowUpRight" /></ReservationButton>
            <AppLink href="/events" className={heroStyles.textLink}>{t("lineup")}<Icon name="arrowRight" /></AppLink>
          </Inline>
        </Stack>
      </Container>
      <Surface className={heroStyles.controls}>
        <Container>
          <Inline gap="md" aria-label={t("chooseSlide")} className="max-w-xl flex-nowrap">
            {slides.map((slide, index) => (
              <Button
                key={slide.key}
                variant="ghost"
                aria-label={active === index ? `${t(slide.key)} · ${playing ? t("pause") : t("play")}` : t("showSlide", { name: t(slide.key) })}
                title={active === index ? (playing ? t("pause") : t("play")) : t("showSlide", { name: t(slide.key) })}
                aria-pressed={active === index}
                onClick={() => active === index ? setPlaying(value => !value) : select(index)}
                className={heroStyles.segment}
              >
                <Typography as="span" variant="small" className={cn("transition-opacity", active === index ? "opacity-100" : "opacity-75")}>{t(slide.key)}</Typography>
                <Surface aria-hidden="true" className="relative h-1.5 w-full overflow-hidden bg-white/30">
                  <Surface className={cn(heroStyles.progress, progressStyles[index < active ? 20 : index === active ? progress : 0])} />
                </Surface>
              </Button>
            ))}
          </Inline>
        </Container>
      </Surface>
      <Typography as="span" role="status" aria-live="polite" className="sr-only">{announcement}</Typography>
    </Section>
  );
}
