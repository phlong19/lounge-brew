type ImagePattern = {
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
};

/** Match only original venue media and public storage at the configured origin. */
export function remoteImagePatterns(supabaseUrl?: string): ImagePattern[] {
  const patterns: ImagePattern[] = [
    {
      protocol: "https",
      hostname: "trixie.com.vn",
      port: "",
      pathname: "/media/**",
    },
  ];
  if (!supabaseUrl) return patterns;

  try {
    const origin = new URL(supabaseUrl);
    if (
      !["https:", "http:"].includes(origin.protocol) ||
      origin.username ||
      origin.password ||
      /[*?]/.test(origin.hostname)
    )
      return patterns;

    const protocol = origin.protocol === "https:" ? "https" : "http";
    for (const pathname of [
      "/storage/v1/object/public/**",
      "/storage/v1/render/image/public/**",
    ]) {
      patterns.push({
        protocol,
        hostname: origin.hostname,
        port: origin.port,
        pathname,
      });
    }
  } catch {
    // Unset/invalid service configuration must not create a broad image proxy.
  }
  return patterns;
}

/** Use the same allowlist before rendering Next Image or stored article media. */
export function isTrustedMediaSource(
  source: string,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
): boolean {
  if (
    !source ||
    source !== source.trim() ||
    /[\u0000-\u001f\u007f\\]/.test(source)
  )
    return false;
  if (source.startsWith("/")) return !source.startsWith("//");
  try {
    const image = new URL(source);
    if (image.username || image.password) return false;
    return remoteImagePatterns(supabaseUrl).some(
      (pattern) =>
        image.protocol === `${pattern.protocol}:` &&
        image.hostname === pattern.hostname &&
        image.port === pattern.port &&
        image.pathname.startsWith(pattern.pathname.slice(0, -2)),
    );
  } catch {
    return false;
  }
}
