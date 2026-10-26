"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithRef } from "react";

import {
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { focusStyles, surfaceStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
export const SheetHeader = DialogHeader;

const sideStyles = {
  right: "inset-y-0 right-0 h-dvh w-[min(88vw,28rem)] border-l",
  left: "inset-y-0 left-0 h-dvh w-[min(88vw,28rem)] border-r",
  top: "inset-x-0 top-0 max-h-[90dvh] w-full border-b",
  bottom: "inset-x-0 bottom-0 max-h-[90dvh] w-full border-t",
} as const;
export function SheetContent({
  side = "right",
  closeLabel = "Close",
  className,
  children,
  ...props
}: Omit<ComponentPropsWithRef<typeof DialogPrimitive.Content>, "asChild"> & {
  side?: keyof typeof sideStyles;
  closeLabel?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-6 overflow-y-auto border-[#15201C]/15 p-6 shadow-2xl",
          surfaceStyles.paper,
          sideStyles[side],
          className,
        )}
        {...props}
        asChild={false}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className={cn(
            "absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md hover:bg-stone-200",
            focusStyles,
          )}
        >
          <Icon name="x" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
