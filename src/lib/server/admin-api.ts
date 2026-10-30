import { canManageEvents } from "@/lib/admin/roles";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventInputError } from "@/lib/admin/event-validation";

export class AdminApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new AdminApiError("Nguồn yêu cầu không hợp lệ.", 403);
}
export async function requireStaff(request?: Request) {
  const token = request?.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = token && url && key ? createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}}) : await createSupabaseServerClient();
  if (!supabase) throw new AdminApiError("Chưa cấu hình kết nối Supabase.",503);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new AdminApiError("Vui lòng đăng nhập.",401);
  const staff = await supabase.from("staff_members").select("role,is_active").eq("user_id",user.id).maybeSingle();
  if (staff.error) throw new AdminApiError("Không thể kiểm tra quyền truy cập.",503);
  if (!canManageEvents(staff.data)) throw new AdminApiError("Tài khoản chưa có quyền quản lý nội dung.",403);
  return { supabase, user, role: staff.data.role as "admin" | "editor" };
}
export async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new AdminApiError("Thiếu nội dung yêu cầu.");
  let size = 0;
  const decoder = new TextDecoder();
  let text = "";
  try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 4*1024*1024) { await reader.cancel(); throw new AdminApiError("Nội dung quá lớn.",413); } text += decoder.decode(part.value,{stream:true}); } text += decoder.decode(); }
  finally { reader.releaseLock(); }
  try { return JSON.parse(text); } catch { throw new AdminApiError("Dữ liệu JSON không hợp lệ."); }
}
export function apiFailure(error: unknown) {
  if (error instanceof AdminApiError) return NextResponse.json({error:error.message},{status:error.status});
  if (error instanceof EventInputError) return NextResponse.json({error:error.message},{status:400});
  console.error("Admin request failed", error instanceof Error ? error.name : "database operation");
  return NextResponse.json({error:"Không thể lưu dữ liệu. Vui lòng thử lại."},{status:500});
}
export function eventId(id: string) { if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) throw new AdminApiError("Không tìm thấy sự kiện.",404); return id; }
export function databaseFailure(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") throw new AdminApiError("Sự kiện hoặc ảnh đã tồn tại.",409);
  if (error.code === "42501") throw new AdminApiError("Không có quyền thực hiện thao tác này.",403);
  if (["23514","23503","22007","22008"].includes(error.code || "")) throw new AdminApiError("Dữ liệu hoặc ảnh của sự kiện không hợp lệ.");
  throw new AdminApiError("Không thể truy cập dữ liệu. Kiểm tra kết nối và cập nhật cơ sở dữ liệu.",503);
}

export async function resolveEventCover(supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"], payload: Record<string,unknown>) {
  if (!payload.cover_asset_id) return;
  const asset = await supabase.from("media_assets").select("object_path").eq("id",payload.cover_asset_id).eq("bucket_id","lounge-public").maybeSingle();
  databaseFailure(asset.error);
  if (!asset.data) throw new AdminApiError("Vui lòng chọn ảnh bìa trong thư viện công khai.");
  payload.cover_image_url = supabase.storage.from("lounge-public").getPublicUrl(asset.data.object_path).data.publicUrl;
}
