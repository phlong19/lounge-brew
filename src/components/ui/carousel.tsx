"use client";

import { Children, useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import Autoplay from "embla-carousel-autoplay";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { carouselControlStyles } from "@/lib/ui/styles";

const columnStyles = { 1: "basis-full", 2: "sm:basis-1/2", 3: "sm:basis-1/2 lg:basis-1/3", 4: "sm:basis-1/2 lg:basis-1/4" } as const;
type Props = ComponentPropsWithRef<"div"> & {
  label: string;
  orientation?: "horizontal" | "vertical";
  visibleSlides?: 2 | 4;
  columns?: keyof typeof columnStyles;
  heading: ReactNode;
  action?: ReactNode;
  controls?: boolean;
  autoScroll?: boolean;
  autoplay?: boolean;
  showCounter?: boolean;
  indicators?: boolean;
  indicatorTone?: "brand" | "inverse";
  paused?: boolean;
  pauseOnHover?: boolean;
  headerClassName?: string;
  compactControls?: boolean;
  rows?: 1 | 2;
  controlPosition?: "header" | "sides";
  step?: "page" | "responsive";
  onNavigate?: () => void;
};

/** Embla owns continuous movement. Interaction and motion preferences gate it. */
export function Carousel({ label, orientation = "horizontal", visibleSlides = 2, columns = 3, heading, action, controls = true, autoScroll = false, autoplay = false, showCounter = true, indicators = false, indicatorTone = "brand", paused = false, pauseOnHover = true, headerClassName, compactControls = false, rows = 1, controlPosition = "header", step = "page", onNavigate, className, children, ref, ...props }: Props) {
  const t = useTranslations("Carousel");
  const id = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const items = Children.toArray(children);
  const slides = rows === 2 ? Array.from({ length: Math.ceil(items.length / 2) }, (_, index) => items.slice(index * 2, index * 2 + 2)) : items.map(item => [item]);
  const sideControls = controls && controlPosition === "sides";
  const automatic = autoScroll || autoplay;
  const vertical = orientation === "vertical";
  const plugins = useMemo(() => autoScroll ? [AutoScroll({ speed: 0.65, startDelay: 0, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: false, stopOnFocusIn: false })] : autoplay ? [Autoplay({ delay: 4500, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: false, stopOnFocusIn: false })] : [], [autoScroll, autoplay]);
  const [viewport, api] = useEmblaCarousel({ axis: vertical ? "y" : "x", align: "start", slidesToScroll: vertical || step === "responsive" || automatic ? 1 : "auto", containScroll: "trimSnaps", dragFree: autoScroll, loop: automatic, breakpoints: { ...(step === "responsive" ? { "(min-width: 1024px)": { slidesToScroll: 2 } } : {}), "(prefers-reduced-motion: reduce)": { duration: 0 } } }, plugins);
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
    if (!api || !onNavigate) return;
    api.on("pointerDown", onNavigate).on("select", onNavigate).on("reInit", onNavigate);
    return () => { api.off("pointerDown", onNavigate).off("select", onNavigate).off("reInit", onNavigate); };
  }, [api, onNavigate]);
  useEffect(() => {
    if (!automatic) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)), { threshold: 0.1 });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); observer.disconnect(); };
  }, [automatic]);
  useEffect(() => {
    if (!api || !automatic) return;
    const scrollPlayer = api.plugins().autoScroll;
    const stepPlayer = api.plugins().autoplay;
    const player = scrollPlayer ?? stepPlayer;
    if (!player) return;
    const sync = () => setPlaying(player.isPlaying());
    api.on("autoScroll:play", sync).on("autoScroll:stop", sync).on("autoplay:play", sync).on("autoplay:stop", sync);
    const permitted = !paused && !(pauseOnHover && hovered) && !focused && !pressed && inView && !hidden && !reduced;
    const apply = () => {
      if (permitted && api.scrollSnapList().length > 1) { if (scrollPlayer) scrollPlayer.play(0); else stepPlayer?.play(); }
      else player.stop();
      sync();
    };
    // Let Embla finish pointer-up/reinitialization before reapplying the gates.
    const afterEngine = () => queueMicrotask(apply);
    apply();
    api.on("pointerUp", afterEngine).on("reInit", afterEngine);
    return () => { player.stop(); api.off("autoScroll:play", sync).off("autoScroll:stop", sync).off("autoplay:play", sync).off("autoplay:stop", sync).off("pointerUp", afterEngine).off("reInit", afterEngine); };
  }, [api, automatic, paused, pauseOnHover, hovered, focused, pressed, inView, hidden, reduced]);
  const previousButton = <Button variant="outline" size={compactControls ? "iconSm" : "icon"} className={sideControls ? carouselControlStyles.side : undefined} aria-label={t("previous")} aria-controls={id} disabled={!state.ready || !state.previous} onClick={() => { onNavigate?.(); api?.scrollPrev(); }}><Icon name={vertical ? "chevronUp" : "arrowLeft"} className={compactControls ? "size-4" : undefined} /></Button>;
  const nextButton = <Button variant="outline" size={compactControls ? "iconSm" : "icon"} className={sideControls ? carouselControlStyles.side : undefined} aria-label={t("next")} aria-controls={id} disabled={!state.ready || !state.next} onClick={() => { onNavigate?.(); api?.scrollNext(); }}><Icon name={vertical ? "chevronDown" : "arrowRight"} className={compactControls ? "size-4" : undefined} /></Button>;
  return <div {...props} ref={node => { root.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} role="region" aria-label={label} aria-roledescription={t("carousel")} data-carousel-engine="embla" data-carousel-index={state.selected} data-auto-scroll-state={automatic ? playing ? "playing" : "paused" : undefined} className={cn("min-w-0", className)}
    onPointerEnter={event => { props.onPointerEnter?.(event); if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={event => { props.onPointerLeave?.(event); if (event.pointerType === "mouse") setHovered(false); setPressed(false); }}
    onPointerDown={event => { props.onPointerDown?.(event); setPressed(true); }}
    onPointerUp={event => { props.onPointerUp?.(event); setPressed(false); }}
    onPointerCancel={event => { props.onPointerCancel?.(event); setPressed(false); }}
    onFocusCapture={event => { props.onFocusCapture?.(event); setFocused((event.target as HTMLElement).matches(":focus-visible")); }}
    onBlurCapture={event => { props.onBlurCapture?.(event); if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={event => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented || (event.target as HTMLElement).closest("[data-food-details]") || (event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
      if (event.key === (vertical ? "ArrowUp" : "ArrowLeft") || event.key === (vertical ? "ArrowDown" : "ArrowRight")) { event.preventDefault(); onNavigate?.(); setFocused(true); if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) api?.scrollNext(); else api?.scrollPrev(); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); onNavigate?.(); setFocused(true); api?.scrollTo(event.key === "Home" ? 0 : api.scrollSnapList().length - 1); }
    }}>
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10",vertical && "mb-5 items-center gap-2 md:mb-5",headerClassName)}>
      <div className={cn("min-w-0 flex-1",vertical ? "basis-0" : "basis-72")}>{heading}</div>
      {action || (controls && !sideControls) ? <div className="flex flex-wrap items-center gap-5">{action}{controls && !sideControls ? <div className="flex items-center gap-2">
        {previousButton}
        {showCounter ? <Typography as="span" variant="small" role="status" aria-live="polite" aria-atomic="true" className="min-w-12 text-center tabular-nums"><Typography as="span" className="sr-only">{t("page", { current: state.selected + 1, total: state.pages })}</Typography><Typography as="span" aria-hidden="true">{state.selected + 1} / {state.pages}</Typography></Typography> : null}
        {nextButton}
      </div> : null}</div> : null}
    </div>
    <div className={cn("min-w-0", sideControls && "grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 lg:gap-4")}>
    {sideControls ? previousButton : null}
    <div id={id} ref={viewport} data-ready={state.ready} tabIndex={0} aria-label={label} className={cn("min-w-0 overflow-x-auto data-[ready=true]:overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4", vertical && "h-[560px] overflow-y-auto overflow-x-hidden")}>
      <div className={vertical ? "-mt-4 flex h-full flex-col touch-pan-x touch-pinch-zoom" : "-ml-6 flex touch-pan-y touch-pinch-zoom"}>
        {slides.map((slide, index) => <div key={index} role="group" aria-roledescription={t("slide")} aria-label={t("item", { current: index + 1, total: slides.length })} inert={state.ready && visible.length > 0 && !visible.includes(index)} className={cn("min-w-0 shrink-0 grow-0", vertical ? cn("pt-4",visibleSlides === 4 ? "basis-1/4" : "basis-1/2") : cn("basis-full pl-6", columnStyles[columns]))}><div className={cn("min-w-0", rows === 2 && "grid grid-rows-2 gap-8")}>{slide}</div></div>)}
      </div>
    </div>
    {sideControls ? nextButton : null}
    </div>
    {indicators && state.ready && state.pages > 1 ? <div className="mt-5 flex flex-wrap items-center justify-center gap-0 sm:gap-1" role="group" aria-label={label}>
      {Array.from({ length: state.pages }, (_, index) => <Button key={index} variant="ghost" size="iconSm" className="size-7 rounded-full hover:bg-[#2E7017]/10 sm:size-8" aria-label={t("page", { current: index + 1, total: state.pages })} aria-controls={id} aria-current={state.selected === index ? "page" : undefined} onClick={() => { onNavigate?.(); api?.scrollTo(index); }}><span aria-hidden="true" className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", state.selected === index ? cn("w-5", indicatorTone === "inverse" ? "bg-[#FFFAE7]" : "bg-[#2E7017]") : cn("w-2", indicatorTone === "inverse" ? "bg-[#FFFAE7]/40" : "bg-[#2E7017]/25"))} /></Button>)}
    </div> : null}
  </div>;
}

export function CarouselItem({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />;
}

/** Controlled single-page Embla adapter. No autoplay or continuous-scroll plugins. */
export function PagedCarousel({ index, onIndexChange, label, children, className }: {
  index: number; onIndexChange: (index: number) => void; label: string;
  children: ReactNode; className?: string;
}) {
  const t = useTranslations("Carousel");
  const initialIndex = useRef(index);
  const [viewport, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: false, startIndex: initialIndex.current,
    breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } } });
  const dragging = useRef(false);
  const current = useRef(index), changed = useRef(onIndexChange);
  current.current = index; changed.current = onIndexChange;
  useEffect(() => {
    if (!api) return;
    const selected = () => { const next = api.selectedScrollSnap(); if (dragging.current && next !== current.current) changed.current(next); };
    const pointerDown = () => { dragging.current = true; };
    const settled = () => { dragging.current = false; };
    const resized = () => { dragging.current = false; api.scrollTo(current.current, true); };
    api.on("select", selected).on("reInit", resized).on("pointerDown", pointerDown).on("settle", settled);
    return () => { api.off("select", selected).off("reInit", resized).off("pointerDown", pointerDown).off("settle", settled); };
  }, [api]);
  useEffect(() => { if (api && api.selectedScrollSnap() !== index) api.scrollTo(index); }, [api, index]);
  return <div ref={viewport} role="region" aria-label={label} aria-roledescription={t("carousel")} data-carousel-engine="embla" data-carousel-index={index}
    tabIndex={0} className={cn("min-w-0 overflow-hidden touch-pan-y touch-pinch-zoom focus-visible:outline-2 focus-visible:outline-inset", className)}
    onKeyDown={event => {
      if ((event.target as HTMLElement).closest("button,input,textarea,select,[contenteditable=true]") || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); changed.current(Math.max(0, Math.min(Children.count(children) - 1, current.current + (event.key === "ArrowRight" ? 1 : -1)))); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); changed.current(event.key === "Home" ? 0 : Children.count(children) - 1); }
    }}>
    <div className="flex h-full">
      {Children.toArray(children).map((child, slide) => <div key={slide} role="group" aria-roledescription={t("slide")} aria-label={t("item", { current: slide + 1, total: Children.count(children) })} aria-hidden={slide !== index} inert={slide !== index} className="h-full min-w-0 shrink-0 grow-0 basis-full">{child}</div>)}
    </div>
  </div>;
}
