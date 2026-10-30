import type { ReactNode } from "react";
import { normalizeTextColor } from "@/lib/content/text-color";

/** User-approved exception: only a validated rich-text colour can be an inline style. */
export function ColoredText({ color, children }: { color: string; children: ReactNode }) {
  const safeColor = normalizeTextColor(color);
  return safeColor ? <span style={{ color: safeColor }}>{children}</span> : <span>{children}</span>;
}
