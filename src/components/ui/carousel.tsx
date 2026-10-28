"use client";

import { Children, useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const columnStyles = { 2: "sm:basis-1/2", 3: "sm:basis-1/2 lg:basis-1/3", 4: "sm:basis-1/2 lg:basis-1/4" } as const;
type Props = ComponentPropsWithRef<"div"> & {
  label: string;
  columns?: keyof typeof columnStyles;
  heading: ReactNode;
  action?: ReactNode;
  controls?: boolean;
  autoplay?: boolean;
  paused?: boolean;
};

/** Embla owns transforms and timers. Owned interaction state gates autoplay. */
export function Carousel({ label, columns = 3, heading, action, controls = true, autoplay = false, paused = false, className, children, ref, ...props }: Props) {
  const t = useTranslations("Carousel");
  const id = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const plugins = useMemo(() => autoplay ? [Autoplay({ delay: 4000, playOnInit: false, stopOnInteraction: false, stopOnMouseEnter: false, stopOnFocusIn: false })] : [], [autoplay]);
  const [viewport, api] = useEmblaCarousel({ align: "start", slidesToScroll: autoplay ? 1 : "auto", containScroll: "trimSnaps", loop: autoplay, breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } } }, plugins);
  const [state, setState] = useState({ ready: false, previous: false, next: false, selected: 0, pages: 1 });
  const [visible, setVisible] = useState<number[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [playing, setPlaying] = useState(false);
  const update = useCallback(() => {
    if (api) setState({ ready: true, previous: api.canScrollPrev(), next: api.canScrollNext(), selected: api.selectedScrollSnap(), pages: api.scrollSnapList().length });
  }, [api]);
  const updateVisible = useCallback(() => { if (api) setVisible(api.slidesInView()); }, [api]);
  useEffect(() => {
    if (!api) return;
    update(); updateVisible();
    api.on("select", update).on("reInit", update).on("reInit", updateVisible).on("settle", updateVisible).on("slidesInView", updateVisible);
    return () => { api.off("select", update).off("reInit", update).off("reInit", updateVisible).off("settle", updateVisible).off("slidesInView", updateVisible); };
  }, [api, update, updateVisible]);
  useEffect(() => {
    if (!autoplay) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { threshold: 0.1 });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); };
  }, [autoplay]);
  useEffect(() => {
    const player = api?.plugins().autoplay;
    if (!player) return;
    const sync = () => setPlaying(player.isPlaying());
    api?.on("autoplay:play", sync).on("autoplay:stop", sync);
    const permitted = autoplay && !paused && !hovered && !focused && !pressed && inView && !hidden && !reduced;
    const apply = () => { if (permitted) player.play(); else player.stop(); sync(); };
    // Embla also processes pointer-up and reinitialization; reapply our full gate.
    const afterEngine = () => queueMicrotask(apply);
    apply();
    api?.on("pointerUp", afterEngine).on("reInit", afterEngine);
    return () => { player.stop(); api?.off("autoplay:play", sync).off("autoplay:stop", sync).off("pointerUp", afterEngine).off("reInit", afterEngine); };
  }, [api, autoplay, paused, hovered, focused, pressed, inView, hidden, reduced]);
  return <div {...props} ref={node => { root.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} role="region" aria-label={label} aria-roledescription={t("carousel")} data-carousel-engine="embla" data-carousel-index={state.selected} data-autoplay-state={autoplay ? playing ? "playing" : "paused" : undefined} className={cn("min-w-0", className)}
    onPointerEnter={event => { props.onPointerEnter?.(event); if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={event => { props.onPointerLeave?.(event); if (event.pointerType === "mouse") setHovered(false); setPressed(false); }}
    onPointerDown={event => { props.onPointerDown?.(event); setPressed(true); }}
    onPointerUp={event => { props.onPointerUp?.(event); setPressed(false); }}
    onPointerCancel={event => { props.onPointerCancel?.(event); setPressed(false); }}
    onFocusCapture={event => { props.onFocusCapture?.(event); setFocused((event.target as HTMLElement).matches(":focus-visible")); }}
    onBlurCapture={event => { props.onBlurCapture?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={event => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented || (event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); setFocused(true); if (event.key === "ArrowRight") api?.scrollNext(); else api?.scrollPrev(); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); setFocused(true); api?.scrollTo(event.key === "Home" ? 0 : api.scrollSnapList().length - 1); }
    }}>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
      <div className="min-w-0 flex-1 basis-72">{heading}</div>
      {action || controls ? <div className="flex flex-wrap items-center gap-5">{action}{controls ? <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label={t("previous")} aria-controls={id} disabled={!state.ready || !state.previous} onClick={() => api?.scrollPrev()}><Icon name="arrowLeft" /></Button>
        <Typography as="span" variant="small" role="status" aria-live="polite" aria-atomic="true" className="min-w-12 text-center tabular-nums"><Typography as="span" className="sr-only">{t("page", { current: state.selected + 1, total: state.pages })}</Typography><Typography as="span" aria-hidden="true">{state.selected + 1} / {state.pages}</Typography></Typography>
        <Button variant="outline" size="icon" aria-label={t("next")} aria-controls={id} disabled={!state.ready || !state.next} onClick={() => api?.scrollNext()}><Icon name="arrowRight" /></Button>
      </div> : null}</div> : null}
    </div>
    <div id={id} ref={viewport} data-ready={state.ready} tabIndex={0} aria-label={label} className="min-w-0 overflow-x-auto data-[ready=true]:overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4">
      <div className="-ml-6 flex touch-pan-y touch-pinch-zoom">
        {Children.map(children, (child, index) => <div role="group" aria-roledescription={t("slide")} aria-label={t("item", { current: index + 1, total: Children.count(children) })} inert={state.ready && visible.length > 0 && !visible.includes(index)} className={cn("min-w-0 shrink-0 grow-0 basis-full pl-6", columnStyles[columns])}>{child}</div>)}
      </div>
    </div>
  </div>;
}

export function CarouselItem({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />;
}
