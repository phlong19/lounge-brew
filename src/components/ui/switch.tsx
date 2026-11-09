"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentPropsWithRef } from "react";
import { focusStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

/** Shadcn switch, adapted to the project's Tailwind-only theme. */
export function Switch({ className, ...props }: ComponentPropsWithRef<typeof SwitchPrimitive.Root>) {
  return <SwitchPrimitive.Root data-slot="switch" className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/40 bg-white/20 transition-colors data-[state=checked]:bg-[#2E7017] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none", focusStyles, className)} {...props}>
    <SwitchPrimitive.Thumb data-slot="switch-thumb" className="pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none" />
  </SwitchPrimitive.Root>;
}
