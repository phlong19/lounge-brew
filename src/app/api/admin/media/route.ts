import { createHash } from "node:crypto";
import sharp from "sharp";
import { putR2Image, r2PublicUrl, r2Config } from "@/lib/server/r2";
import { NextResponse } from "next/server";
import { AdminApiError, apiFailure, assertSameOrigin, databaseFailure, requireContentStaff } from "@/lib/server/admin-api";
import { posterFileError } from "@/lib/admin/poster";
export const runtime = "nodejs";
export async function POST(request:Request) {
  try {
    assertSameOrigin(request);
    const {supabase,user} = await requireContentStaff(request);
    if (Number(request.headers.get("content-length")) > 11*1024*1024) throw new AdminApiError("Ảnh không được vượt quá 10 MB.",413);
    const reader = request.body?.getReader();
    if (!reader) throw new AdminApiError("Thiếu tệp ảnh.");
    let size = 0;
    const chunks: Uint8Array[] = [];
    try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 11*1024*1024) { await reader.cancel(); throw new AdminApiError("Ảnh không được vượt quá 10 MB.",413); } chunks.push(part.value); } }
    finally { reader.releaseLock(); }
    const form = await new Response(Buffer.concat(chunks),{headers:{"Content-Type":request.headers.get("content-type") || ""}}).formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new AdminApiError("Vui lòng chọn ảnh.");
    const validation = posterFileError(file);
    if (validation) throw new AdminApiError(validation);
    const bytes = Buffer.from(await file.arrayBuffer());
    let metadata;
    try { metadata = await sharp(bytes,{limitInputPixels:40000000}).metadata(); } catch { throw new AdminApiError("Không thể đọc ảnh. Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ."); }
    const mime: Record<string,string> = {jpeg:"image/jpeg",png:"image/png",webp:"image/webp"};
    if (!metadata.width || !metadata.height || metadata.width*metadata.height > 40000000 || metadata.pages && metadata.pages > 1 || mime[metadata.format || ""] !== file.type) throw new AdminApiError("Định dạng hoặc kích thước ảnh không hợp lệ.");
    const purpose = form.get("purpose") || "event";
    if (!["event","blog","core"].includes(String(purpose))) throw new AdminApiError("Mục đích ảnh không hợp lệ.");
    const provider = purpose === "core" ? "supabase" : "r2";
    let bucket = "lounge-public";
    if (provider === "r2") { try { bucket = r2Config().bucket; } catch { throw new AdminApiError("Chưa cấu hình kho ảnh R2.",503); } }
    const hash = createHash("sha256").update(bytes).digest("hex");
    const path = `${provider === "r2" ? purpose === "blog" ? "blogs" : "events" : "core"}/${hash}.${metadata.format === "jpeg" ? "jpg" : metadata.format}`;
    const existing = await supabase.from("media_assets").select("*").eq("provider",provider).eq("bucket_id",bucket).eq("object_path",path).maybeSingle();
    databaseFailure(existing.error);
    const url = provider === "r2" ? r2PublicUrl(path) : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    if (existing.data) return NextResponse.json({asset:existing.data,url});
    if (provider === "r2") { try { await putR2Image(path,bytes,file.type); } catch { throw new AdminApiError("Không thể tải ảnh lên R2. Vui lòng thử lại.",503); } }
    else {
    const upload = await supabase.storage.from("lounge-public").upload(path,bytes,{contentType:file.type,upsert:false,cacheControl:"31536000"});
    if (upload.error && !["409","Duplicate"].includes(String(upload.error.statusCode)) && !/already exists/i.test(upload.error.message)) throw new AdminApiError("Không thể tải ảnh lên. Vui lòng thử lại.",503);
    }
    const source = form.get("sourceUrl");
    let sourceUrl: string|null = null;
    if (typeof source === "string") { try { const parsed = new URL(source); if (parsed.protocol === "https:" && parsed.hostname === "trixie.com.vn" && !parsed.username && !parsed.password) sourceUrl = parsed.href; } catch {} }
    const insert = await supabase.from("media_assets").insert({provider,bucket_id:bucket,object_path:path,original_filename:file.name.slice(0,240),mime_type:file.type,size_bytes:bytes.length,width:metadata.width,height:metadata.height,alt_vi:typeof form.get("alt") === "string" ? String(form.get("alt")).slice(0,500) : "",source_url:sourceUrl,created_by:user.id}).select().single();
    if (insert.error?.code === "23505") {
      const retry = await supabase.from("media_assets").select("*").eq("provider",provider).eq("bucket_id",bucket).eq("object_path",path).single(); databaseFailure(retry.error); return NextResponse.json({asset:retry.data,url});
    }
    databaseFailure(insert.error);
    return NextResponse.json({asset:insert.data,url},{status:201});
  } catch(error) { return apiFailure(error); }
}
