import type { UrlObject } from "node:url";

const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
const controlCharacters = /[\u0000-\u001f\u007f-\u009f]/;

function decodedProbe(value: string) {
  let decoded = value
    .replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (_, hex, decimal) => {
      const point = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
      return point <= 0x10ffff ? String.fromCodePoint(point) : "";
    })
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

function safeString(value: string) {
  const trimmed = value.trim();
  const probe = decodedProbe(trimmed);
  if (controlCharacters.test(value) || controlCharacters.test(probe))
    return null;
  // Browsers can normalize whitespace and backslashes before interpreting schemes.
  const schemeProbe = probe.replace(/\s/g, "").replaceAll("\\", "/");
  const scheme = /^([^/?#]*):/.exec(schemeProbe);
  if (scheme && !allowedProtocols.has(`${scheme[1].toLowerCase()}:`))
    return null;
  try {
    if (
      !allowedProtocols.has(
        new URL(trimmed, "https://trixie.invalid/").protocol,
      )
    )
      return null;
  } catch {
    return null;
  }
  return trimmed;
}

/** Only navigation schemes used by the site are accepted, including URL objects. */
export function safeHref(href: string | UrlObject): string | UrlObject | null {
  if (typeof href === "string") return safeString(href);
  if (!href || typeof href !== "object" || Array.isArray(href)) return null;
  for (const value of Object.values(href)) {
    if (
      typeof value === "string" &&
      (controlCharacters.test(value) ||
        controlCharacters.test(decodedProbe(value)))
    )
      return null;
  }
  if (
    href.href !== undefined &&
    (typeof href.href !== "string" || safeString(href.href) === null)
  )
    return null;
  if (href.protocol !== undefined && href.protocol !== null) {
    if (typeof href.protocol !== "string") return null;
    const protocol = `${href.protocol.trim().replace(/:$/, "").toLowerCase()}:`;
    if (!allowedProtocols.has(protocol)) return null;
  }
  if (
    href.pathname !== undefined &&
    href.pathname !== null &&
    (typeof href.pathname !== "string" || safeString(href.pathname) === null)
  )
    return null;
  // A host is serialized independently by Next Link; reject path/protocol injection.
  for (const host of [href.host, href.hostname]) {
    if (
      host !== undefined &&
      host !== null &&
      (typeof host !== "string" || /[\s/?#\\@]/.test(host))
    )
      return null;
  }
  return { ...href };
}
