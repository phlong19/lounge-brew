import {
  createElement,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type Ref,
} from "react";

import { gapStyles, surfaceStyles, typographyStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

type LayoutTag =
  | "div"
  | "main"
  | "section"
  | "nav"
  | "header"
  | "footer"
  | "article"
  | "figure"
  | "address";
export type LayoutProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

function layoutPrimitive(tag: LayoutTag, base: string) {
  return function LayoutPrimitive({ className, ref, ...props }: LayoutProps) {
    return createElement(tag, {
      ...props,
      ref,
      className: cn(base, className),
    });
  };
}

export const Container = layoutPrimitive(
  "div",
  "mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-12",
);
export const Section = layoutPrimitive(
  "section",
  "scroll-mt-24 py-12 md:py-20",
);
export const Main = layoutPrimitive("main", "min-h-dvh");
export const Navigation = layoutPrimitive("nav", "flex items-center gap-4");
export const SiteHeaderFrame = layoutPrimitive(
  "header",
  "relative z-40 w-full",
);
export const SiteFooterFrame = layoutPrimitive("footer", "py-12 md:py-16");
export const Article = layoutPrimitive("article", "min-w-0");
export const Figure = layoutPrimitive("figure", "min-w-0");
export const Address = layoutPrimitive("address", "not-italic");

export function Surface({
  tone = "transparent",
  className,
  ...props
}: LayoutProps & { tone?: keyof typeof surfaceStyles }) {
  return createElement("div", {
    ...props,
    className: cn("min-w-0", surfaceStyles[tone], className),
  });
}

type SpacingProps = LayoutProps & { gap?: keyof typeof gapStyles };
export function Stack({ gap = "md", className, ...props }: SpacingProps) {
  return createElement("div", {
    ...props,
    className: cn("flex min-w-0 flex-col", gapStyles[gap], className),
  });
}
export function Inline({ gap = "md", className, ...props }: SpacingProps) {
  return createElement("div", {
    ...props,
    className: cn(
      "flex min-w-0 flex-wrap items-center",
      gapStyles[gap],
      className,
    ),
  });
}
export function Grid({ gap = "lg", className, ...props }: SpacingProps) {
  return createElement("div", {
    ...props,
    className: cn("grid min-w-0", gapStyles[gap], className),
  });
}

type ListProps =
  | (ComponentPropsWithRef<"ul"> & { ordered?: false })
  | (ComponentPropsWithRef<"ol"> & { ordered: true });
export function List({ ordered = false, className, ...props }: ListProps) {
  return createElement(ordered ? "ol" : "ul", {
    ...props,
    className: cn("m-0 list-none p-0", className),
  });
}
export function ListItem({ className, ...props }: ComponentPropsWithRef<"li">) {
  return <li className={cn("min-w-0", className)} {...props} />;
}
export function Status({ className, ...props }: ComponentPropsWithRef<"p">) {
  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(typographyStyles.small, className)}
      {...props}
    />
  );
}
export function VisuallyHidden({
  className,
  ...props
}: ComponentPropsWithRef<"span">) {
  return <span className={cn("sr-only", className)} {...props} />;
}

export function NoScript(props: ComponentPropsWithRef<"noscript">) {
  return <noscript {...props} />;
}
