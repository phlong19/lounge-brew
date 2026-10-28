"use client";

import Link from "next/link";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  SyntheticEvent,
} from "react";

import { safeHref } from "@/lib/ui/href";
import { focusStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

export type AppLinkProps = ComponentPropsWithRef<typeof Link>;

function blockActivation(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function blockKeyboardActivation(event: KeyboardEvent) {
  if (event.key === "Enter" || event.key === " " || event.key === "Spacebar")
    blockActivation(event);
}

export function AppLink({
  href,
  as,
  target,
  rel,
  className,
  prefetch,
  replace,
  scroll,
  shallow,
  passHref,
  locale,
  legacyBehavior,
  onNavigate,
  transitionTypes,
  ...props
}: AppLinkProps) {
  const destination = safeHref(href);
  const displayed = as === undefined ? undefined : safeHref(as);
  const disabled =
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true" ||
    destination === null ||
    displayed === null;
  const safeRel =
    target === "_blank"
      ? Array.from(
          new Set(`${rel ?? ""} noopener noreferrer`.trim().split(/\s+/)),
        ).join(" ")
      : rel;
  const classes = cn("rounded-sm underline-offset-4", focusStyles, className);
  if (disabled) {
    return (
      <a
        {...props}
        role={props.role ?? "link"}
        target={target}
        rel={safeRel}
        className={classes}
        aria-disabled="true"
        tabIndex={-1}
        onClick={blockActivation}
        onClickCapture={blockActivation}
        onAuxClick={blockActivation}
        onAuxClickCapture={blockActivation}
        onPointerDown={blockActivation}
        onPointerDownCapture={blockActivation}
        onKeyDown={blockKeyboardActivation}
        onKeyDownCapture={blockKeyboardActivation}
        onKeyUp={blockKeyboardActivation}
        onKeyUpCapture={blockKeyboardActivation}
        onKeyPress={blockKeyboardActivation}
        onKeyPressCapture={blockKeyboardActivation}
      />
    );
  }
  return (
    <Link
      {...props}
      href={destination}
      as={displayed ?? undefined}
      target={target}
      rel={safeRel}
      className={classes}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      locale={locale}
      legacyBehavior={legacyBehavior}
      onNavigate={onNavigate}
      transitionTypes={transitionTypes}
    />
  );
}
