/** Next may expose its bind address in request.url; Host retains the browser authority. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get("host");
    return source.origin === origin && source.protocol === target.protocol &&
      source.host === (host ? new URL(`${target.protocol}//${host}`).host : target.host);
  } catch {
    return false;
  }
}
