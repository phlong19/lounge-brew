import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Small vector flags remain legible on platforms without flag emoji fonts. */
export function Flag({ locale, className, ...props }: Omit<ComponentPropsWithoutRef<"svg">, "style"> & { locale: "vi" | "en" }) {
  return <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" className={cn("h-4 w-6 shrink-0 overflow-hidden rounded-sm", className)} {...props}>
    {locale === "vi" ? <><path fill="#DA251D" d="M0 0h24v16H0z" /><path fill="#FFFF00" d="m12 3 1.17 3.59h3.77l-3.05 2.22 1.17 3.6L12 10.19l-3.06 2.22 1.17-3.6-3.05-2.22h3.77z" /></> : <><path fill="#012169" d="M0 0h24v16H0z" /><path stroke="#FFF" strokeWidth="4" d="m0 0 24 16M24 0 0 16" /><path stroke="#C8102E" strokeWidth="1.5" d="m0 0 24 16M24 0 0 16" /><path stroke="#FFF" strokeWidth="6" d="M12 0v16M0 8h24" /><path stroke="#C8102E" strokeWidth="3" d="M12 0v16M0 8h24" /></>}
  </svg>;
}
