"use client";

import * as Primitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { popupMotion } from "@/lib/ui/motion-styles";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export function PopoverContent({ className, sideOffset = 8, ...props }: ComponentProps<typeof Primitive.Content>) {
  return <Primitive.Portal><Primitive.Content {...props} sideOffset={sideOffset} collisionPadding={12} className={cn("z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-stone-200 bg-white p-4 text-[#15201C] shadow-lg outline-none", popupMotion, className)} /></Primitive.Portal>;
}
