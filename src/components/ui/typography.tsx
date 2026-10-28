import { createElement, type HTMLAttributes, type Ref } from "react";

import { textToneStyles, typographyStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

type TextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "small"
  | "strong"
  | "em"
  | "blockquote"
  | "figcaption"
  | "time";

export type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement;
  variant?: keyof typeof typographyStyles;
  tone?: keyof typeof textToneStyles;
  dateTime?: string;
  cite?: string;
  ref?: Ref<HTMLElement>;
};

export function Typography({
  as = "p",
  variant = "body",
  tone = "inherit",
  className,
  ref,
  ...props
}: TypographyProps) {
  return createElement(as, {
    ...props,
    ref,
    className: cn(typographyStyles[variant], textToneStyles[tone], className),
  });
}
