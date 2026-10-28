"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentPropsWithRef } from "react";

import { Icon } from "@/components/ui/icon";
import {
  controlStyles,
  surfaceStyles,
  typographyStyles,
} from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export function SelectTrigger({
  className,
  children,
  ...props
}: Omit<ComponentPropsWithRef<typeof SelectPrimitive.Trigger>, "asChild">) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        controlStyles,
        "flex min-h-11 items-center justify-between gap-3 text-left",
        className,
      )}
      {...props}
      asChild={false}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon name="chevronDown" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
export function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: Omit<ComponentPropsWithRef<typeof SelectPrimitive.Content>, "asChild">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-[70] max-h-80 min-w-48 overflow-hidden rounded-md border border-[#15201C]/20 shadow-xl",
          surfaceStyles.paper,
          className,
        )}
        {...props}
        asChild={false}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center">
          <Icon name="chevronUp" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center">
          <Icon name="chevronDown" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
export function SelectItem({
  className,
  children,
  ...props
}: Omit<ComponentPropsWithRef<typeof SelectPrimitive.Item>, "asChild">) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-11 cursor-default items-center rounded-sm py-2 pr-9 pl-3 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[#006B57] data-[highlighted]:text-[#FFFAE7]",
        className,
      )}
      {...props}
      asChild={false}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center justify-center">
        <Icon name="check" className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
export function SelectLabel({
  className,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        typographyStyles.caption,
        "px-3 py-2 text-stone-600",
        className,
      )}
      {...props}
    />
  );
}
export function SelectSeparator({
  className,
  ...props
}: ComponentPropsWithRef<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("my-1 h-px bg-[#15201C]/15", className)}
      {...props}
    />
  );
}
