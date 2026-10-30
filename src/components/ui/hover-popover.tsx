"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Slot } from "@radix-ui/react-slot";
import { createContext, useContext, useEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { popupMotion } from "@/lib/ui/motion-styles";
import { cn } from "@/lib/utils";

type Mode = "hover" | "keyboard" | "pinned";
type HoverContext = {
  root: React.RefObject<HTMLDivElement | null>;
  trigger: React.RefObject<HTMLElement | null>;
  cancel: () => void;
  leave: () => void;
  pin: () => void;
  following: boolean;
  restore: React.RefObject<boolean>;
  suppressFocus: React.RefObject<boolean>;
};
const Context = createContext<HoverContext | null>(null);
function useHover() { const value = useContext(Context); if (!value) throw new Error("HoverPopover parts require HoverPopover"); return value; }

/** Rich hover preview, optionally anchored to the cursor; focus/tap remain interactive. */
export function HoverPopover({ open, onOpenChange, children, className, resetKey = 0, followCursor = false }: { resetKey?: number; followCursor?: boolean; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const opening = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mode = useRef<Mode>("hover");
  const [interaction, setInteraction] = useState<Mode>("hover");
  const cursor = useRef({ x: 0, y: 0 });
  // Radix reads this virtual anchor through its own positioning engine.
  // Pointer movement only updates coordinates; owned code never writes styles.
  const virtualAnchor = useRef({ getBoundingClientRect: () => mode.current === "hover" ? new DOMRect(cursor.current.x, cursor.current.y, 0, 0) : trigger.current?.getBoundingClientRect() ?? new DOMRect() });
  const restore = useRef(false);
  const suppressFocus = useRef(false);
  const cancel = () => { if (opening.current) clearTimeout(opening.current); if (closing.current) clearTimeout(closing.current); opening.current = closing.current = null; };
  const setMode = (next: Mode) => { mode.current = next; setInteraction(next); };
  useEffect(() => () => { if (opening.current) clearTimeout(opening.current); if (closing.current) clearTimeout(closing.current); }, []);
  useEffect(() => { if (opening.current) clearTimeout(opening.current); if (closing.current) clearTimeout(closing.current); mode.current = "hover"; }, [resetKey]);
  const leave = () => { cancel(); if (mode.current === "hover") { if (followCursor) onOpenChange(false); else closing.current = setTimeout(() => onOpenChange(false), 180); } };
  const following = followCursor && interaction === "hover";
  const value: HoverContext = { root, trigger, cancel, leave, following, restore, suppressFocus, pin: () => { cancel(); setMode("pinned"); onOpenChange(true); } };
  return <Context.Provider value={value}><PopoverPrimitive.Root open={open} modal={false} onOpenChange={next => { cancel(); onOpenChange(next); }}>
    <div ref={root} className={className}
      onPointerMove={event => { if (event.pointerType !== "mouse") return; cursor.current = { x: event.clientX, y: event.clientY }; if (followCursor && !open) { cancel(); setMode("hover"); onOpenChange(true); } }}
      onPointerEnter={event => { if (event.pointerType !== "mouse") return; cursor.current = { x: event.clientX, y: event.clientY }; cancel(); if (open || followCursor) return; setMode("hover"); opening.current = setTimeout(() => onOpenChange(true), 250); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") leave(); }}
      onFocusCapture={event => { if (suppressFocus.current) { suppressFocus.current = false; return; } if ((event.target as HTMLElement).matches(":focus-visible")) { cancel(); setMode("keyboard"); onOpenChange(true); } }}>
      {children}
    </div>
    {followCursor ? <PopoverPrimitive.Anchor virtualRef={virtualAnchor} /> : null}
  </PopoverPrimitive.Root></Context.Provider>;
}

export function HoverPopoverTrigger({ children, navigate = false }: { children: ReactNode; navigate?: boolean }) {
  const context = useHover();
  if (navigate) return <Slot ref={context.trigger}>{children}</Slot>;
  return <PopoverPrimitive.Trigger asChild ref={node => { context.trigger.current = node; }} onClick={event => { if (event.defaultPrevented) return; event.preventDefault(); context.pin(); }}>{children}</PopoverPrimitive.Trigger>;
}

type ContentProps = Omit<ComponentPropsWithRef<typeof PopoverPrimitive.Content>, "asChild"> & { closeLabel: string };
export function HoverPopoverContent({ children, className, closeLabel, ...props }: ContentProps) {
  const context = useHover();
  const [wide, setWide] = useState(false);
  useEffect(() => { const media = window.matchMedia("(min-width: 1024px)"); const update = () => setWide(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  return <PopoverPrimitive.Portal><div className={cn("contents", context.following && "pointer-events-none")}>
    <PopoverPrimitive.Content {...props} asChild={false} data-food-details data-follow-cursor={context.following}
      side={wide ? "right" : "bottom"} align="start" sideOffset={context.following ? 24 : 12} alignOffset={context.following ? 18 : 0} collisionPadding={16} avoidCollisions
      updatePositionStrategy={context.following ? "always" : "optimized"}
      className={cn("z-[80] max-h-[min(80dvh,640px)] w-[min(360px,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-[#15201C]/15 bg-white p-5 text-[#15201C] shadow-lg outline-none", context.following && "pointer-events-none select-none", popupMotion, className)}
      onPointerEnter={context.cancel} onPointerLeave={context.leave}
      onOpenAutoFocus={event => event.preventDefault()}
      onCloseAutoFocus={event => { event.preventDefault(); if (context.restore.current) { context.restore.current = false; context.suppressFocus.current = true; context.trigger.current?.focus({ preventScroll: true }); queueMicrotask(() => { context.suppressFocus.current = false; }); } }}
      onEscapeKeyDown={() => { context.cancel(); context.restore.current = true; }}
      onInteractOutside={event => { if (context.root.current?.contains(event.target as Node)) event.preventDefault(); }}>
      {children}
      {!context.following ? <PopoverPrimitive.Close asChild><Button variant="ghost" size="icon" aria-label={closeLabel} className="absolute top-2 right-2 bg-white/95 hover:bg-[#F1EEE7]" onClick={() => { context.cancel(); context.restore.current = true; }}><Icon name="x" /></Button></PopoverPrimitive.Close> : null}
    </PopoverPrimitive.Content>
  </div></PopoverPrimitive.Portal>;
}
