import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/** Keep third-party frames within the primitive boundary, with an accessible title. */
export function Embed({ className, title, ...props }: ComponentPropsWithRef<"iframe"> & { title: string }) {
  return <iframe title={title} className={cn("block max-w-full border-0", className)} {...props} />;
}
