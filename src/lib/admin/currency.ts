const formatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
export function formatVndAmount(value: number | null | undefined) {
  return value == null ? "" : formatter.format(value);
}
/** Currency separators are presentation only; never persist the formatted string. */
export function parseVndAmount(input: string): number | null | undefined {
  const digits = input.replace(/[.,\s₫đ]/gi, "");
  if (!digits) return null;
  if (!/^\d+$/.test(digits)) return undefined;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}
