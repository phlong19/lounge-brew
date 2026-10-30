import { parseDocument } from "htmlparser2";
import { isTrustedMediaSource } from "@/lib/config/image-patterns";
import { normalizeTextColor } from "@/lib/content/text-color";
import { safeHref } from "@/lib/ui/href";

export class EventInputError extends Error {}
const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
type Node = ReturnType<typeof parseDocument>["children"][number];
/** Store only the same constrained HTML that the public renderer understands. */
export function sanitizeEventContent(html: string): string {
  const blocked = new Set(["script","style","iframe","svg","math","object","embed","form","input","button","template"]);
  const tags = new Set(["p","h2","h3","strong","em","u","ul","ol","li","blockquote","br"]);
  function render(node: Node): string {
    if (node.type === "text") return escape(node.data);
    if (node.type !== "tag" || blocked.has(node.name)) return "";
    if (node.name === "img") return isTrustedMediaSource(node.attribs.src || "") ? `<img src="${escape(node.attribs.src)}" alt="${escape((node.attribs.alt || "").slice(0,500))}">` : "";
    const body = node.children.map(render).join("");
    if (node.name === "a") { const href = safeHref(node.attribs.href || ""); return typeof href === "string" ? `<a href="${escape(href)}">${body}</a>` : body; }
    if (node.name === "span") { const color = normalizeTextColor(node.attribs["data-text-color"]); return color ? `<span data-text-color="${color}">${body}</span>` : body; }
    if (!tags.has(node.name)) return body;
    return node.name === "br" ? "<br>" : `<${node.name}>${body}</${node.name}>`;
  }
  return parseDocument(html).children.map(render).join("").trim();
}
export function eventPayload(input: unknown, partial = false): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new EventInputError("Dữ liệu sự kiện không hợp lệ.");
  const raw = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  if ("expectedUpdatedAt" in raw && (typeof raw.expectedUpdatedAt !== "string" || raw.expectedUpdatedAt.length > 64 || !Number.isFinite(Date.parse(raw.expectedUpdatedAt)))) throw new EventInputError("Phiên bản sự kiện không hợp lệ.");
  const strings: Record<string, number> = { title_vi:200,title_en:200,performer_name:160,event_date:64,end_date:64,description_vi:5000,description_en:5000,content_vi:500000,content_en:500000,cover_image_url:2048,cover_asset_id:36,source_id:160,source_url:2048 };
  const allowed = new Set([...Object.keys(strings),"is_active","additional_fee","additionalFee","isDeleted","expectedUpdatedAt"]);
  for (const key of Object.keys(raw)) if (!allowed.has(key)) throw new EventInputError(`Trường không được hỗ trợ: ${key}`);
  for (const [key,max] of Object.entries(strings)) if (key in raw) {
    const value = raw[key];
    if (value === null && !["title_vi","performer_name","event_date","content_vi"].includes(key)) { result[key] = null; continue; }
    if (typeof value !== "string" || value.length > max) throw new EventInputError(`Giá trị ${key} không hợp lệ.`);
    result[key] = key.startsWith("content_") ? sanitizeEventContent(value) : value.trim() || null;
  }
  for (const key of ["title_vi","performer_name","event_date"]) if ((!partial || key in raw) && !result[key]) throw new EventInputError("Vui lòng nhập tên chương trình, nghệ sĩ và ngày diễn.");
  for (const key of ["event_date","end_date"]) if (result[key] != null) {
    const value = result[key] as string;
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new EventInputError("Ngày giờ phải có múi giờ hợp lệ.");
    result[key] = new Date(value).toISOString();
  }
  if (result.event_date && result.end_date && Date.parse(result.end_date as string) < Date.parse(result.event_date as string)) throw new EventInputError("Giờ kết thúc phải sau giờ bắt đầu.");
  if (result.cover_image_url && !isTrustedMediaSource(result.cover_image_url as string)) throw new EventInputError("Ảnh bìa không thuộc thư viện ảnh được hỗ trợ.");
  if (result.cover_asset_id && !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(result.cover_asset_id as string)) throw new EventInputError("Mã ảnh bìa không hợp lệ.");
  if (result.source_id && !/^[A-Za-z0-9_-]+$/.test(result.source_id as string)) throw new EventInputError("Mã nguồn sự kiện không hợp lệ.");
  if (result.source_url) { try { const url = new URL(result.source_url as string); if (url.protocol !== "https:" || url.username || url.password) throw new Error(); } catch { throw new EventInputError("Liên kết nguồn không hợp lệ."); } }
  if ("is_active" in raw) { if (typeof raw.is_active !== "boolean") throw new EventInputError("Trạng thái không hợp lệ."); result.is_active = raw.is_active; }
  if ("isDeleted" in raw) { if (typeof raw.isDeleted !== "boolean") throw new EventInputError("Trạng thái xóa không hợp lệ."); result.is_deleted = raw.isDeleted; }
  const fee = raw.additional_fee ?? raw.additionalFee;
  if ("additional_fee" in raw || "additionalFee" in raw) {
    if (fee != null && (!Number.isSafeInteger(fee) || Number(fee) < 0)) throw new EventInputError("Phụ thu phải là số nguyên VNĐ không âm.");
    result.additional_fee = fee ?? null;
  }
  if (result.is_deleted) result.is_active = false;
  return result;
}
