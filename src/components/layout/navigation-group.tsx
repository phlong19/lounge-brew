"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Navigation, Stack, Surface } from "@/components/ui/layout";
import { AppLink } from "@/components/ui/link";
import type { NavigationItem } from "@/types/navigation";

export function NavigationGroup({ item }: { item: NavigationItem }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return <Surface ref={root} className="relative" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <Button ref={trigger} variant="ghost" className="px-1 font-medium" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>{item.label}<Icon name="chevronDown" className="size-3.5" /></Button>
    {open ? <Surface id={id} tone="white" className="absolute top-full left-0 z-50 min-w-60 rounded-md p-3 shadow-lg"><Navigation aria-label={item.label} className="block"><Stack gap="xs">{item.children?.map(child => <AppLink key={child.key} href={child.href} className="flex min-h-11 items-center justify-between gap-4 rounded-sm px-3 py-2 text-sm hover:bg-stone-100" onClick={() => setOpen(false)}>{child.label}<Icon name="arrowUpRight" className="size-4" /></AppLink>)}</Stack></Navigation></Surface> : null}
  </Surface>;
}
