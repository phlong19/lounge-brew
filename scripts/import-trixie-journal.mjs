import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { DomUtils, parseDocument } from "htmlparser2";
import sharp from "sharp";
import { normalizeSourceMarkup } from "./lib/trixie-import.mjs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
registerHooks({ resolve(specifier, context, next) {
  return next(specifier.startsWith("@/") ? pathToFileURL(`${process.cwd()}/src/${specifier.slice(2)}.ts`).href : specifier, context);
} });
const { blogPayload } = await import("../src/lib/admin/blog-validation.ts");

const source = new URL("https://trixie.com.vn/tin-tuc.html");
const apply = process.argv.includes("--apply");
const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (base !== "https://zcftrbvrfiypqtwhmxxj.supabase.co" || !secret?.startsWith("sb_secret_") || !publicKey) {
  throw Error("Expected the configured Trixie Supabase project and its import keys.");
}
const auth = { persistSession: false, autoRefreshToken: false };
const db = createClient(base, secret, { auth });
const publicDb = createClient(base, publicKey, { auth });
const all = (node, predicate) => DomUtils.findAll(predicate, node.children ?? []);
const text = node => DomUtils.textContent(node).replace(/\s+/g, " ").trim();
const hasClass = (node, name) => node.attribs?.class?.split(/\s+/).includes(name);
const hash = bytes => createHash("sha256").update(bytes).digest("hex");

function officialUrl(path, relativeTo, isImage = false) {
  const url = new URL(path, relativeTo);
  if (url.hostname === source.hostname && url.protocol === "http:") url.protocol = "https:";
  if (url.origin !== source.origin || url.username || url.password || (isImage && !url.pathname.startsWith("/media/"))) {
    throw Error("Unexpected original URL.");
  }
  return url.href;
}
async function download(url) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`Download failed (${response.status}).`);
  return response;
}
function originalDate(card) {
  const match = text(card).match(/Cập nhật ngày\s+(\d{2}):(\d{2})\s+(\d{2})-(\d{2})-(\d{4})/);
  if (!match) throw Error("Article update timestamp missing.");
  const [, hour, minute, day, month, year] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:00+07:00`;
}
function imageUrls(html) {
  return all(parseDocument(html), node => node.name === "img").map(node => node.attribs.src);
}

const listing = parseDocument(await (await download(source)).text());
const links = all(listing, node => node.name === "a" && node.parent?.name === "h2" && /-A\d+\.html$/.test(node.attribs.href ?? ""));
const articles = [];
for (const link of links.slice(0, 5)) {
  const url = officialUrl(link.attribs.href, source);
  const slug = new URL(url).pathname.slice(1).replace(/-A\d+\.html$/, "").replace(/-+$/, "");
  const card = link.parent.parent.parent.parent;
  const cover = all(card, node => node.name === "img")[0]?.attribs.src;
  if (!cover) throw Error(`Article cover missing: ${slug}`);
  const document = parseDocument(await (await download(url)).text());
  const title = text(link);
  const heading = all(document, node => node.name === "h1" && text(node) === title)[0];
  const body = all(document, node => hasClass(node, "pageText"))[0];
  if (!heading || !body || !text(body)) throw Error(`Original article incomplete: ${slug}`);
  for (const image of all(body, node => node.name === "img")) {
    if (!image.attribs.src) throw Error(`Body image missing its original URL: ${slug}`);
    image.attribs.src = officialUrl(image.attribs.src, url, true);
  }
  const publishedAt = originalDate(card);
  if (Date.parse(publishedAt) > Date.now()) throw Error(`Article timestamp is in the future: ${slug}`);
  const article = blogPayload({ title_vi: title, slug, content_vi: normalizeSourceMarkup(DomUtils.getInnerHTML(body)), published_at: publishedAt, thumbnail_url: officialUrl(cover, url, true) });
  const bodyText = text(body);
  const images = all(body, node => node.name === "img").map(node => node.attribs.src);
  if (text(parseDocument(article.content_vi)) !== bodyText || JSON.stringify(imageUrls(article.content_vi)) !== JSON.stringify(images)) {
    throw Error(`Sanitization changed article text or dropped an image: ${slug}`);
  }
  const existing = await db.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (existing.error) throw Error(`Database lookup failed (${existing.error.code}).`);
  if (existing.data) { console.log(`Existing article preserved: ${slug}`); continue; }
  articles.push({ article, bodyText, images });
  console.log(`Verified: ${slug} (${bodyText.length} characters, ${images.length} body images)`);
}
if (!links.length) throw Error("The original listing contains no article cards.");
if (!apply) process.exit(0);

const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET_NAME: bucket, R2_PUBLIC_BASE_URL: delivery } = process.env;
if (!account || !accessKeyId || !secretAccessKey || !bucket || !delivery) throw Error("R2 must be configured for editorial imports.");
const r2 = new S3Client({ region: "auto", endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });
const hosted = new Map();
async function storeImage(url, alt) {
  if (hosted.has(url)) return hosted.get(url);
  const bytes = Buffer.from(await (await download(url)).arrayBuffer());
  if (bytes.length > 10 * 1024 * 1024) throw Error("Original image exceeds the upload limit.");
  const { format, width, height, pages } = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
  const mime = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[format];
  if (!mime || !width || !height || width * height > 40000000 || pages > 1) throw Error("Unsupported original image.");
  const checksum = hash(bytes);
  const path = `blogs/${checksum}.${format === "jpeg" ? "jpg" : format}`;
  const existing = await db.from("media_assets").select("id").eq("provider", "r2").eq("bucket_id", bucket).eq("object_path", path).maybeSingle();
  if (existing.error) throw Error(`Asset lookup failed (${existing.error.code}).`);
  if (!existing.data) {
    await r2.send(new PutObjectCommand({ Bucket: bucket, Key: path, Body: bytes, ContentType: mime, CacheControl: "public, max-age=31536000, immutable" }));
    const { error } = await db.from("media_assets").insert({ provider: "r2", bucket_id: bucket, object_path: path, source_url: url, original_filename: new URL(url).pathname.split("/").pop(), mime_type: mime, size_bytes: bytes.length, width, height, alt_vi: alt });
    if (error && error.code !== "23505") throw Error(`Asset registration failed (${error.code}).`);
  }
  const publicUrl = `${delivery.replace(/\/$/, "")}/${path}`;
  if (hash(Buffer.from(await (await download(publicUrl)).arrayBuffer())) !== checksum) throw Error("Hosted image bytes differ from the source.");
  hosted.set(url, publicUrl);
  return publicUrl;
}
for (const { article, bodyText, images } of articles) {
  const doc = parseDocument(article.content_vi);
  for (const image of all(doc, node => node.name === "img")) {
    image.attribs.src = await storeImage(image.attribs.src, image.attribs.alt || article.title_vi);
  }
  const payload = blogPayload({ ...article, content_vi: DomUtils.getInnerHTML(doc), thumbnail_url: await storeImage(article.thumbnail_url, article.title_vi) });
  const { data: saved, error } = await db.from("articles").insert(payload).select("id").single();
  if (error) throw Error(`Article insert failed (${error.code}).`);
  const { data: visible, error: readError } = await publicDb.from("articles").select("title_vi,content_vi,thumbnail_url").eq("id", saved.id).single();
  if (readError || visible?.title_vi !== article.title_vi || visible.thumbnail_url !== payload.thumbnail_url || text(parseDocument(visible.content_vi)) !== bodyText || JSON.stringify(imageUrls(visible.content_vi)) !== JSON.stringify(images.map(url => hosted.get(url)))) {
    throw Error(`Public verification failed for ${article.slug}.`);
  }
  console.log(`Published and verified: /journal/${article.slug}`);
}
console.log(`${articles.length} articles published, ${hosted.size} original image URLs verified.`);
