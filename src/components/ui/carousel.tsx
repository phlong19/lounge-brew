"use client";

import { Children, useCallback, useEffect, useId, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const columnStyles = {
  2: "sm:basis-1/2",
  3: "sm:basis-1/2 lg:basis-1/3",
  4: "sm:basis-1/2 lg:basis-1/4",
} as const;

type Props = ComponentPropsWithRef<"div"> & {
  label: string;
  columns?: keyof typeof columnStyles;
  heading: ReactNode;
  action?: ReactNode;
};

/** shadcn's Embla engine, isolated here; authored layout remains Tailwind-only. */
export function Carousel({ label, columns = 3, heading, action, className, children, ref, ...props }: Props) {
  const t = useTranslations("Carousel");
  const id = useId();
  const [viewport, api] = useEmblaCarousel({
    align: "start",
    slidesToScroll: "auto",
    containScroll: "trimSnaps",
    loop: false,
    breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } },
  });
  const [state, setState] = useState({ ready: false, previous: false, next: false, selected: 0, pages: 1 });
  const [visible, setVisible] = useState<number[]>([]);
  const update = useCallback(() => {
    if (!api) return;
    setState({ ready: true, previous: api.canScrollPrev(), next: api.canScrollNext(), selected: api.selectedScrollSnap(), pages: api.scrollSnapList().length });
  }, [api]);
  const updateVisible = useCallback(() => { if (api) setVisible(api.slidesInView()); }, [api]);
  useEffect(() => {
    if (!api) return;
    update(); updateVisible();
    api.on("select", update).on("reInit", update).on("reInit", updateVisible).on("settle", updateVisible).on("slidesInView", updateVisible);
    return () => { api.off("select", update).off("reInit", update).off("reInit", updateVisible).off("settle", updateVisible).off("slidesInView", updateVisible); };
  }, [api, update, updateVisible]);
  return (
    <div {...props} ref={ref} role="region" aria-label={label} aria-roledescription={t("carousel")} data-carousel-engine="embla" className={cn("min-w-0", className)}
      onKeyDown={event => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented || (event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); if (event.key === "ArrowRight") api?.scrollNext(); else api?.scrollPrev(); }
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); api?.scrollTo(event.key === "Home" ? 0 : api.scrollSnapList().length - 1); }
      }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-10">
        <div className="min-w-0 flex-1 basis-72">{heading}</div>
        <div className="flex flex-wrap items-center gap-5">
          {action}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label={t("previous")} aria-controls={id} disabled={!state.ready || !state.previous} onClick={() => api?.scrollPrev()}><Icon name="arrowLeft" /></Button>
            <Typography as="span" variant="small" role="status" aria-live="polite" aria-atomic="true" className="min-w-12 text-center tabular-nums"><Typography as="span" className="sr-only">{t("page", { current: state.selected + 1, total: state.pages })}</Typography><Typography as="span" aria-hidden="true">{state.selected + 1} / {state.pages}</Typography></Typography>
            <Button variant="outline" size="icon" aria-label={t("next")} aria-controls={id} disabled={!state.ready || !state.next} onClick={() => api?.scrollNext()}><Icon name="arrowRight" /></Button>
          </div>
        </div>
      </div>
      <div id={id} ref={viewport} data-ready={state.ready} tabIndex={0} aria-label={label} className="min-w-0 overflow-x-auto data-[ready=true]:overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4">
        <div className="-ml-6 flex touch-pan-y touch-pinch-zoom">
          {Children.map(children, (child, index) => <div role="group" aria-roledescription={t("slide")} aria-label={t("item", { current: index + 1, total: Children.count(children) })} inert={state.ready && visible.length > 0 && !visible.includes(index)} className={cn("min-w-0 shrink-0 grow-0 basis-full pl-6", columnStyles[columns])}>{child}</div>)}
        </div>
      </div>
    </div>
  );
}

export function CarouselItem({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />;
}
