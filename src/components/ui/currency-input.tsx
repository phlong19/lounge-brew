"use client";

import type { ComponentPropsWithRef } from "react";
import { Input } from "@/components/ui/form";
import { formatVndAmount, parseVndAmount } from "@/lib/admin/currency";
import { cn } from "@/lib/utils";

type Props = Omit<ComponentPropsWithRef<typeof Input>, "value" | "onChange" | "type"> & { value: number | null | undefined; onValueChange: (value: number | null) => void };
export function CurrencyInput({ value, onValueChange, className, ...props }: Props) {
  return <Input {...props} type="text" inputMode="numeric" className={cn("tabular-nums", className)} value={formatVndAmount(value)} onChange={event => {
    const node = event.currentTarget;
    const digitsBefore = node.value.slice(0, node.selectionStart ?? node.value.length).replace(/\D/g, "").length;
    const next = parseVndAmount(node.value);
    if (next === undefined) return;
    onValueChange(next);
    requestAnimationFrame(() => {
      if (document.activeElement !== node) return;
      let position = 0, digits = 0;
      while (position < node.value.length && digits < digitsBefore) { if (/\d/.test(node.value[position])) digits++; position++; }
      node.setSelectionRange(position, position);
    });
  }} />;
}
