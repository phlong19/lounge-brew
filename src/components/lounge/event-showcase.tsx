"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { memo, useEffect, useEffectEvent, useId, useMemo, useRef, useState, type PointerEvent } from "react";

import { EventTicket } from "@/components/lounge/home-ticket-shows";
import { PublicQueryState } from "@/components/lounge/public-query-state";
import { Button } from "@/components/ui/button";
import { Container, Grid, Section, Stack, Surface } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import type { AppLocale } from "@/i18n/config";
import { scriptHeadingFont } from "@/lib/fonts";
import { localizeEvents } from "@/lib/menu/map-menu";
import { publicEventsOptions } from "@/lib/public/query";
import { ticketStyles } from "@/lib/ui/ticket-styles";
import { cn } from "@/lib/utils";

const pageSize = 6;
const ShowcaseTicket = memo(EventTicket);
// Two static utility groups give each drag step 128 positions without inline styles.
const ticketFractionMajor = [
  "[--fraction-major:0]", "[--fraction-major:0.0625]", "[--fraction-major:0.125]", "[--fraction-major:0.1875]",
  "[--fraction-major:0.25]", "[--fraction-major:0.3125]", "[--fraction-major:0.375]", "[--fraction-major:0.4375]",
  "[--fraction-major:0.5]", "[--fraction-major:0.5625]", "[--fraction-major:0.625]", "[--fraction-major:0.6875]",
  "[--fraction-major:0.75]", "[--fraction-major:0.8125]", "[--fraction-major:0.875]", "[--fraction-major:0.9375]",
] as const;
const ticketFractionMinor = [
  "[--fraction-minor:0]", "[--fraction-minor:0.0078125]", "[--fraction-minor:0.015625]", "[--fraction-minor:0.0234375]",
  "[--fraction-minor:0.03125]", "[--fraction-minor:0.0390625]", "[--fraction-minor:0.046875]", "[--fraction-minor:0.0546875]",
] as const;
const subdivisions = ticketFractionMajor.length * ticketFractionMinor.length;
const ticketSteps = [
  "[--step:-4] z-[9]", "[--step:-3] z-[8]", "[--step:-2] z-[7]", "[--step:-1] z-[6]",
  "[--step:0] z-[5]", "[--step:1] z-[4]", "[--step:2] z-[3]", "[--step:3] z-[2]", "[--step:4] z-[1]",
] as const;
const ticketPose = [
  "[--distance:calc(var(--step)_-_var(--fraction-major)_-_var(--fraction-minor))]",
  "[--yaw:clamp(-20deg,calc(var(--distance)_*_15deg),22deg)]",
  "[--depth:calc(max(0,var(--distance))_*_-30px)]",
  "[--size:clamp(.84,calc(1_-_var(--distance)_*_.04),1.04)]",
  "[transform:translate3d(calc(var(--distance)_*_var(--stride)),calc(var(--distance)_*_var(--rise)),var(--depth))_rotateY(var(--yaw))_scale(var(--size))]",
] as const;

type Gesture = {
  id: number;
  originTicket: string | undefined;
  x: number;
  y: number;
  position: number;
  spacing: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  horizontal: boolean;
};

export function EventShowcase({ locale, title }: { locale: AppLocale; title: string }) {
  const shows = useTranslations("Shows");
  const { data, dataUpdatedAt, isError, refetch } = useQuery(publicEventsOptions());
  const [limit, setLimit] = useState(pageSize);
  const [position, setPosition] = useState(subdivisions);
  const [moving, setMoving] = useState(false);
  const [touchOrigin, setTouchOrigin] = useState<string>();
  const positionRef = useRef(1);
  const animation = useRef(0);
  const dragFrame = useRef(0);
  const gesture = useRef<Gesture | null>(null);
  const dragged = useRef(false);
  const stage = useRef<HTMLElement>(null);
  const id = useId();

  useEffect(() => () => {
    cancelAnimationFrame(animation.current);
    cancelAnimationFrame(dragFrame.current);
  }, []);

  const events = useMemo(
    () => localizeEvents(locale, data ?? [], new Date(dataUpdatedAt)),
    [data, dataUpdatedAt, locale],
  );
  const visible = events.slice(0, limit);
  const hasMore = visible.length < events.length;
  const last = Math.max(0, visible.length - Number(!hasMore));
  const quantized = Math.min(position, last * subdivisions);
  const active = Math.round(quantized / subdivisions);
  const anchor = Math.floor(quantized / subdivisions);
  const fraction = quantized % subdivisions;

  function paintPosition() {
    setPosition(Math.round(positionRef.current * subdivisions));
  }

  function updatePosition(next: number) {
    positionRef.current = Math.max(0, Math.min(next, last));
    paintPosition();
  }

  function select(target: number, coasting = false) {
    cancelAnimationFrame(animation.current);
    cancelAnimationFrame(dragFrame.current);
    dragFrame.current = 0;
    const to = Math.max(0, Math.min(target, last));
    const from = Math.min(positionRef.current, last);
    if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updatePosition(to);
      setMoving(false);
      return;
    }

    setMoving(true);
    const duration = coasting ? Math.min(540, 220 + Math.abs(to - from) * 90) : 330;
    let started: number | undefined;
    function frame(time: number) {
      started ??= time;
      const progress = Math.min(1, (time - started) / duration);
      updatePosition(to + (from - to) * (1 - progress) ** 3);
      if (progress < 1) animation.current = requestAnimationFrame(frame);
      else setMoving(false);
    }
    animation.current = requestAnimationFrame(frame);
  }

  function startDrag(id: number, x: number, y: number, time: number, target: EventTarget | null, area: HTMLElement) {
    dragged.current = false;
    if (!(target instanceof Element) || target.closest("button:not([data-showcase-select])")) return false;
    const ticket = area.querySelector<HTMLElement>("[data-showcase-ticket]");
    if (!ticket) return false;
    const stride = getComputedStyle(ticket).getPropertyValue("--stride");
    const spacing = ticket.offsetWidth * Number.parseFloat(stride) / 100;
    if (!spacing) return false;

    gesture.current = {
      id, x, y, spacing,
      originTicket: target.closest<HTMLElement>("[data-showcase-ticket]")?.dataset.showcaseTicket,
      position: Math.min(positionRef.current, last),
      lastX: x,
      lastTime: time,
      velocity: 0,
      horizontal: false,
    };
  }

  function moveDrag(id: number, x: number, y: number, time: number, capture: (start: Gesture) => void) {
    const start = gesture.current;
    if (!start || start.id !== id) return false;
    const deltaX = x - start.x;
    const deltaY = y - start.y;
    if (!start.horizontal) {
      if (Math.abs(deltaY) > Math.max(6, Math.abs(deltaX))) {
        gesture.current = null;
        return false;
      }
      if (Math.abs(deltaX) < 6) return false;
      cancelAnimationFrame(animation.current);
      start.horizontal = true;
      start.position = Math.min(positionRef.current, last);
      dragged.current = true;
      capture(start);
      setMoving(true);
    }

    const elapsed = time - start.lastTime;
    if (elapsed > 0) {
      start.velocity = (x - start.lastX) / elapsed;
      start.lastX = x;
      start.lastTime = time;
    }
    positionRef.current = Math.max(0, Math.min(start.position - deltaX / start.spacing, last));
    if (!dragFrame.current) {
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = 0;
        paintPosition();
      });
    }
    return true;
  }

  function finishDrag(id: number, time: number, released: boolean) {
    const start = gesture.current;
    if (!start || start.id !== id) return;
    gesture.current = null;
    if (!start.horizontal) return;

    let target = positionRef.current;
    if (released && time - start.lastTime < 90 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const momentum = start.velocity * 160 / start.spacing;
      target -= Math.max(-2.25, Math.min(momentum, 2.25));
    }
    select(Math.round(target), true);
  }

  const handleTouchStart = useEffectEvent((event: TouchEvent, area: HTMLElement) => {
    if (event.touches.length !== 1) {
      if (gesture.current) finishDrag(gesture.current.id, event.timeStamp, false);
      setTouchOrigin(undefined);
      return;
    }
    const touch = event.changedTouches.item(0);
    if (touch) startDrag(touch.identifier, touch.clientX, touch.clientY, event.timeStamp, event.target, area);
  });

  const handleTouchMove = useEffectEvent((event: TouchEvent) => {
    const id = gesture.current?.id;
    if (id === undefined) return;
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === id);
    if (!touch) return;
    const horizontal = moveDrag(id, touch.clientX, touch.clientY, event.timeStamp, (start) => {
      setTouchOrigin(start.originTicket);
    });
    if (horizontal && event.cancelable) event.preventDefault();
  });

  const handleTouchEnd = useEffectEvent((event: TouchEvent) => {
    const id = gesture.current?.id;
    if (id === undefined || !Array.from(event.changedTouches).some((touch) => touch.identifier === id)) return;
    finishDrag(id, event.timeStamp, event.type === "touchend");
    setTouchOrigin(undefined);
  });

  const hasTickets = visible.length > 0;
  useEffect(() => {
    const area = stage.current;
    if (!hasTickets || !area) return;

    const start = (event: TouchEvent) => handleTouchStart(event, area);
    const move = (event: TouchEvent) => handleTouchMove(event);
    const end = (event: TouchEvent) => handleTouchEnd(event);
    area.addEventListener("touchstart", start, { passive: true });
    area.addEventListener("touchmove", move, { passive: false });
    area.addEventListener("touchend", end);
    area.addEventListener("touchcancel", end);
    return () => {
      area.removeEventListener("touchstart", start);
      area.removeEventListener("touchmove", move);
      area.removeEventListener("touchend", end);
      area.removeEventListener("touchcancel", end);
    };
  }, [hasTickets]);

  const slots = hasMore ? [...visible, null] : visible;

  return (
    <Section aria-labelledby={`${id}-title`} className={cn(ticketStyles.section, "py-7 md:py-10")}>
      <Container className="max-w-[1440px]">
        <Typography as="h1" variant="display" id={`${id}-title`} className={cn(scriptHeadingFont.className, "text-center md:text-left")}>
          {title}
        </Typography>
      </Container>
      {data === undefined || !visible.length ? (
        <Container className="pt-6 text-center">
          {data === undefined ? <PublicQueryState error={isError} english={locale === "en"} retry={() => void refetch()} /> : <Typography>{shows("empty")}</Typography>}
        </Container>
      ) : (
        <Surface
          ref={stage}
          role="group"
          aria-label={title}
          aria-keyshortcuts="ArrowLeft ArrowRight"
          id={`${id}-tickets`}
          tabIndex={0}
          className="relative -mt-3 touch-pan-y select-none overflow-hidden bg-[radial-gradient(ellipse_at_48%_49%,#202e25_0%,#0c1512_70%)] focus-visible:outline-2 focus-visible:-outline-offset-2"
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            select(active + (event.key === "ArrowRight" ? 1 : -1));
            stage.current?.focus({ preventScroll: true });
          }}
          onDragStart={(event) => event.preventDefault()}
        >
          <Surface
            className="touch-pan-y cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              if (event.pointerType === "touch" || !event.isPrimary || event.button !== 0) return;
              startDrag(event.pointerId, event.clientX, event.clientY, event.timeStamp, event.target, event.currentTarget);
            }}
            onPointerMove={(event) => {
              if (event.pointerType === "touch") return;
              moveDrag(event.pointerId, event.clientX, event.clientY, event.timeStamp, () => {
                event.currentTarget.setPointerCapture(event.pointerId);
              });
            }}
            onPointerUp={(event) => {
              if (event.pointerType !== "touch") finishDrag(event.pointerId, event.timeStamp, true);
            }}
            onPointerCancel={(event) => {
              if (event.pointerType !== "touch") finishDrag(event.pointerId, event.timeStamp, false);
            }}
            onLostPointerCapture={(event) => {
              if (event.pointerType !== "touch") finishDrag(event.pointerId, event.timeStamp, false);
            }}
            onClickCapture={(event) => {
              if (!dragged.current || !event.detail) return;
              dragged.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <Grid gap="none" className={cn(
              "justify-items-center pt-12 pb-8 perspective-[1750px] sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20",
              ticketFractionMajor[Math.floor(fraction / ticketFractionMinor.length)],
              ticketFractionMinor[fraction % ticketFractionMinor.length],
            )}>
              {slots.map((event, position) => {
                const ticketId = event?.id ?? "more";
                const offset = position - anchor;
                const outOfView = Math.abs(offset) > 4;
                // Touch events stay targeted at the element where the gesture began.
                if (outOfView && touchOrigin !== ticketId) return null;
                const selected = !moving && position === active;
                const selectable = !selected && Math.abs(position - active) <= 3;

                return (
                  <Surface key={ticketId} data-showcase-ticket={ticketId} data-showcase-active={selected ? "" : undefined} className={cn(
                    "relative col-start-1 row-start-1 w-[clamp(14.25rem,63vw,18rem)] lg:w-[20rem] self-start origin-center will-change-transform",
                    "[--stride:78%] [--rise:-44px] sm:[--stride:89%] sm:[--rise:-65px] lg:[--stride:94%] lg:[--rise:-76px]",
                    outOfView ? "invisible" : ticketSteps[offset + 4],
                    selected && "z-10",
                    ticketPose,
                  )}>
                    {event ? (
                      <>
                        <Surface inert={!selected}>
                          <ShowcaseTicket event={event} locale={locale} presentation="showcase" />
                        </Surface>
                        <Button
                            type="button"
                            variant="ghost"
                            tabIndex={-1}
                            aria-label={event.performerName}
                            aria-hidden={!selectable}
                            className={cn("absolute inset-0 h-full w-full touch-pan-y opacity-0", !selectable && "pointer-events-none")}
                            data-showcase-select
                            onClick={() => select(position)}
                          />
                      </>
                    ) : (
                      <Stack gap="none" className="min-h-[25rem] items-center justify-center md:min-h-[29rem]">
                        {selected ? (
                          <Button variant="outline" className="border-current bg-[#0C1512] text-[#FFFAE7] hover:bg-[#26352b] hover:text-[#FFFAE7]" onClick={() => {
                            setLimit((current) => current + pageSize);
                            stage.current?.focus({ preventScroll: true });
                          }}>
                            {shows("loadMore")}
                          </Button>
                        ) : null}
                      </Stack>
                    )}
                  </Surface>
                );
              })}
            </Grid>
          </Surface>
        </Surface>
      )}
    </Section>
  );
}
