import type { ComponentPropsWithRef } from "react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function CheckboxField({ label, hideLabel = false, className, ...props }: Omit<ComponentPropsWithRef<"input">, "type"> & { label: string; hideLabel?: boolean }) {
  return <label className={cn("inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm", className)}><input {...props} type="checkbox" className="size-5 shrink-0 cursor-pointer accent-[#006B57] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#006B57]" /><Typography as="span" variant="small" className={cn(hideLabel && "md:sr-only")}>{label}</Typography></label>;
}
