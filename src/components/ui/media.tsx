import Image, { type ImageProps } from "next/image";
import type { Ref } from "react";

import { Typography } from "@/components/ui/typography";
import { isTrustedMediaSource } from "@/lib/config/image-patterns";
import { surfaceStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

const fitStyles = { cover: "object-cover", contain: "object-contain" } as const;
export type MediaProps = Omit<ImageProps, "style" | "ref"> & {
  fit?: keyof typeof fitStyles;
  ref?: Ref<HTMLImageElement>;
};

/** The caller owns dimensions or a positioned fill container; artwork uses contain. */
export function Media({
  fit = "cover",
  src,
  alt,
  className,
  ...props
}: MediaProps) {
  if (typeof src === "string" && !isTrustedMediaSource(src)) {
    return (
      <Typography
        as="span"
        variant="small"
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        title={props.title}
        className={cn(
          "inline-flex min-h-24 items-center justify-center rounded-md border border-current/15 p-4 text-center",
          surfaceStyles.paper,
          className,
        )}
      >
        {alt}
      </Typography>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      className={cn(fitStyles[fit], className)}
      {...props}
    />
  );
}
