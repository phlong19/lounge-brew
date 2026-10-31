import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
export function NativeVideo({ className, ...props }: ComponentPropsWithRef<"video">) {
  return <video {...props} controls preload="metadata" className={cn("absolute inset-0 h-full w-full object-contain", className)} />;
}
