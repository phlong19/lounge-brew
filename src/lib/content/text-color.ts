const legacyColors: Record<string, string> = { blue: "#1d4ed8", red: "#b91c1c", green: "#065f46", purple: "#6b21a8" };
export function normalizeTextColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const color = value.trim().toLowerCase();
  if (Object.hasOwn(legacyColors, color)) return legacyColors[color];
  if (/^#[a-f0-9]{6}$/.test(color)) return color;
  if (/^#[a-f0-9]{3}$/.test(color)) return `#${[...color.slice(1)].map(digit => digit + digit).join("")}`;
  return null;
}
