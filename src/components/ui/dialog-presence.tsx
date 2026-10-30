"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

export const dialogTransitionMs = 200;
const PresenceContext = createContext({ open: false, present: false });

/** Keep Radix mounted during a Tailwind exit transition; no DOM styles are authored. */
export function TransitionDialog({ open: controlledOpen, defaultOpen = false, onOpenChange, ...props }: ComponentProps<typeof DialogPrimitive.Root>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const [present, setPresent] = useState(open);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : dialogTransitionMs;
    const timer = window.setTimeout(() => setPresent(false), delay);
    return () => window.clearTimeout(timer);
  }, [open]);
  return <PresenceContext.Provider value={{ open, present: open || present }}><DialogPrimitive.Root {...props} open={open} onOpenChange={value => { if (controlledOpen === undefined) setInternalOpen(value); onOpenChange?.(value); }} /></PresenceContext.Provider>;
}
export function useDialogPresence(children: ReactNode) {
  const presence = useContext(PresenceContext);
  const previousChildren = useRef(children);
  useLayoutEffect(() => { if (presence.open) previousChildren.current = children; }, [presence.open, children]);
  return { ...presence, children: presence.open ? children : previousChildren.current };
}

export function DialogPresence({ children }: { children: ReactNode }) {
  const presence = useDialogPresence(children);
  return presence.present ? <>{presence.children}</> : null;
}
