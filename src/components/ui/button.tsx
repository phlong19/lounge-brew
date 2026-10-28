"use client";

import { Slot } from "@radix-ui/react-slot";
import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";

import { buttonSizeStyles, buttonStyles, focusStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  asChild?: boolean;
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizeStyles;
};

function blockActivation(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function blockKeyboardActivation(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar")
    blockActivation(event);
}

export function Button({
  asChild = false,
  variant = "primary",
  size = "default",
  className,
  type,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-md border font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none",
    focusStyles,
    buttonStyles[variant],
    buttonSizeStyles[size],
    className,
  );
  if (!asChild)
    return (
      <button
        type={type ?? "button"}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  if (!disabled)
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );

  // Slot merges child handlers first. Replace them before slotting so a disabled
  // child's action cannot run before our guard, including programmatic clicks.
  const child = Children.only(children);
  if (!isValidElement<HTMLAttributes<HTMLElement> & { href?: string }>(child))
    throw new Error("Button asChild requires one element.");
  const guards = {
    "aria-disabled": true as const,
    tabIndex: -1,
    onClick: blockActivation,
    onClickCapture: blockActivation,
    onAuxClick: blockActivation,
    onAuxClickCapture: blockActivation,
    onKeyDown: blockKeyboardActivation,
    onKeyDownCapture: blockKeyboardActivation,
    onKeyUp: blockKeyboardActivation,
    onKeyUpCapture: blockKeyboardActivation,
    onPointerDown: blockActivation,
    onPointerDownCapture: blockActivation,
  };
  const guardedChild = cloneElement(child, {
    ...guards,
    ...(child.type === "a"
      ? { href: undefined, role: child.props.role ?? "link" }
      : {}),
  });
  return (
    <Slot {...props} {...guards} className={classes}>
      {guardedChild}
    </Slot>
  );
}
