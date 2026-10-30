"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentPropsWithRef } from "react";

import { surfaceStyles, typographyStyles } from "@/lib/ui/styles";
import { popupMotion } from "@/lib/ui/motion-styles";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentPropsWithRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[80] max-w-64 rounded-md px-3 py-2 shadow-lg",
          surfaceStyles.evening,
          popupMotion,
          typographyStyles.small,
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
