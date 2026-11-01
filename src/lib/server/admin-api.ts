import {cache} from "react";
import { isSameOrigin } from "@/lib/server/request-origin";
import { canAccessAdmin,canManageEvents,type StaffRole } from "@/lib/admin/roles";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventInputError } from "@/lib/admin/event-validation";

export class AdminApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function assertSameOrigin(request: Request) {
  if (!isSameOrigin(request)) throw new AdminApiError("Nguồn yêu cầu không hợp lệ.", 403);
}
async function verifyStaff(request?: Request) {
  const token = request?.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = token && url && key ? createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}}) : await createSupabaseServerClient();
  if (!supabase) throw new AdminApiError("Chưa cấu hình kết nối Supabase.",503);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new AdminApiError("Vui lòng đăng nhập.",401);
  const staff = await supabase.from("staff_members").select("role,is_active,display_name").eq("user_id",user.id).maybeSingle();
  if (staff.error) throw new AdminApiError("Không thể kiểm tra quyền truy cập.",503);
  if (!canAccessAdmin(staff.data)) throw new AdminApiError("Tài khoản chưa có quyền quản lý nội dung.",403);
  const access=await supabase.rpc("staff_access_allowed");
  if(access.error)throw new AdminApiError("Không thể kiểm tra phiên đăng nhập.",503);
  if(!access.data)throw new AdminApiError("Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.",401);
  return { supabase, user, role: staff.data.role as StaffRole, displayName: staff.data.display_name };
}
// React cache is request-scoped: share layout/page verification, never cache roles across users/requests.
const currentStaff=cache(()=>verifyStaff());
export function requireStaff(request?:Request){return request?verifyStaff(request):currentStaff();}
export async function readJson(request: Request, maxBytes=4*1024*1024) {
  const reader = request.body?.getReader();
  if (!reader) throw new AdminApiError("Thiếu nội dung yêu cầu.");
  let size = 0;
  const decoder = new TextDecoder();
  let text = "";
  try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > maxBytes) { await reader.cancel(); throw new AdminApiError("Nội dung quá lớn.",413); } text += decoder.decode(part.value,{stream:true}); } text += decoder.decode(); }
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

export async function requireAdmin(request?: Request) {
  const staff = await requireStaff(request);
  if (staff.role !== "admin") throw new AdminApiError("Chỉ quản trị viên được quản lý nhân viên.",403);
  return staff;
}

export async function requireContentStaff(request?:Request){const staff=await requireStaff(request);if(!canManageEvents({role:staff.role,is_active:true}))throw new AdminApiError("Không có quyền quản lý nội dung.",403);return staff;}
