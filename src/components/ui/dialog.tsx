"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithRef } from "react";

import { Icon } from "@/components/ui/icon";
import { Stack } from "@/components/ui/layout";
import {
  focusStyles,
  surfaceStyles,
  textToneStyles,
  typographyStyles,
} from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/65", className)}
      {...props}
    />
  );
}

export type DialogContentProps = Omit<
  ComponentPropsWithRef<typeof DialogPrimitive.Content>,
  "asChild"
> & {
  closeLabel?: string;
  showCloseButton?: boolean;
};
export function DialogContent({
  className,
  children,
  closeLabel = "Close",
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-lg border border-[#15201C]/15 p-6 shadow-2xl",
          surfaceStyles.paper,
          focusStyles,
          className,
        )}
        {...props}
        asChild={false}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className={cn(
              "absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-md bg-[#FFFAE7] text-[#15201C] hover:bg-stone-200",
              focusStyles,
            )}
          >
            <Icon name="x" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
export function DialogHeader({
  className,
  ...props
}: ComponentPropsWithRef<typeof Stack>) {
  return <Stack gap="sm" className={cn("pr-10", className)} {...props} />;
}
export function DialogFooter({
  className,
  ...props
}: ComponentPropsWithRef<typeof Stack>) {
  return (
    <Stack className={cn("sm:flex-row sm:justify-end", className)} {...props} />
  );
}
export function DialogTitle({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(typographyStyles.subheading, className)}
      {...props}
    />
  );
}
export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(typographyStyles.small, textToneStyles.muted, className)}
      {...props}
    />
  );
}
