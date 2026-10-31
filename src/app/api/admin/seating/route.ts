import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { AdminApiError, apiFailure, assertSameOrigin, databaseFailure, readJson, requireStaff } from "@/lib/server/admin-api";
import { seatingSelect } from "@/lib/seating";
export async function GET(request: Request) {
 try {
  const { supabase } = await requireStaff(request);
  const result = await supabase.from("seating_settings").select(seatingSelect).eq("id","home").single();
  databaseFailure(result.error);
  return NextResponse.json({item:result.data},{headers:{"Cache-Control":"no-store"}});
 } catch(error) { return apiFailure(error); }
}
export async function PATCH(request: Request) {
 try {
  assertSameOrigin(request);
  const { supabase, user } = await requireStaff(request);
  const body = await readJson(request);
  if (!body || typeof body !== "object" || typeof body.is_visible !== "boolean" || typeof body.expectedUpdatedAt !== "string") throw new AdminApiError("Cấu hình không hợp lệ.");
  for (const key of ["lower_asset_id","upper_asset_id"] as const) {
   if (body[key] !== null && (typeof body[key] !== "string" || !/^[a-f0-9-]{36}$/i.test(body[key]))) throw new AdminApiError("Ảnh sơ đồ không hợp lệ.");
   if (body[key]) {
    const asset = await supabase.from("media_assets").select("id").eq("id",body[key]).eq("bucket_id","lounge-public").maybeSingle();
    databaseFailure(asset.error); if (!asset.data) throw new AdminApiError("Vui lòng tải ảnh công khai hợp lệ.");
   }
  }
  if (body.is_visible && (!body.lower_asset_id || !body.upper_asset_id)) throw new AdminApiError("Cần đủ hai ảnh để hiển thị sơ đồ.");
  const result = await supabase.from("seating_settings").update({lower_asset_id:body.lower_asset_id,upper_asset_id:body.upper_asset_id,is_visible:body.is_visible,updated_by:user.id}).eq("id","home").eq("updated_at",body.expectedUpdatedAt).select(seatingSelect).maybeSingle();
  databaseFailure(result.error);
  if (!result.data) throw new AdminApiError("Cấu hình đã thay đổi. Vui lòng tải lại.",409);
  revalidateTag("seating-settings",{expire:0});
  return NextResponse.json({item:result.data});
 } catch(error) { return apiFailure(error); }
}
