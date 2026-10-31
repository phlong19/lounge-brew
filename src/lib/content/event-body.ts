// The pilot importer added this synthetic heading; keep the stored article unchanged.
export function eventBody(content: string): string {
 return content.replace(/^\s*<h2(?:\s[^>]*)?>Minishow [^<]+ · \d{2}\/\d{2}\/\d{4}<\/h2>\s*/i,"");
}
