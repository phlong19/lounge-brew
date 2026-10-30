import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { AdminApiError, apiFailure, assertSameOrigin, databaseFailure, eventId, readJson, resolveEventCover, requireStaff } from "@/lib/server/admin-api";
import { eventPayload } from "@/lib/admin/event-validation";
type Props = {params:Promise<{id:string}>};
export async function GET(request: Request, {params}:Props) {
  try {
    const {supabase} = await requireStaff(request);
    const id = eventId((await params).id);
    const result = await supabase.from("events").select("*").eq("id",id).eq("is_deleted",false).maybeSingle();
    databaseFailure(result.error);
    if (!result.data) throw new AdminApiError("Không tìm thấy sự kiện.",404);
    return NextResponse.json({item:result.data},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return apiFailure(error); }
}
async function mutate(request:Request, props:Props, remove:boolean) {
  try {
    assertSameOrigin(request);
    const {supabase,user} = await requireStaff(request);
    const id = eventId((await props.params).id);
    const raw = remove ? {isDeleted:true} : await readJson(request);
    const payload = eventPayload(raw,true);
    await resolveEventCover(supabase,payload);
    const expected = !remove && typeof raw.expectedUpdatedAt === "string" ? raw.expectedUpdatedAt : null;
    const current = await supabase.from("events").select("*").eq("id",id).maybeSingle();
    databaseFailure(current.error);
    if (!current.data || (current.data.is_deleted && payload.is_deleted !== false)) throw new AdminApiError("Không tìm thấy sự kiện.",404);
    if ("source_id" in payload && payload.source_id !== current.data.source_id) throw new AdminApiError("Không thể thay đổi mã nguồn của sự kiện đã tạo.");
    const merged = {...current.data,...payload};
    if (merged.end_date && Date.parse(merged.end_date) < Date.parse(merged.event_date)) throw new AdminApiError("Giờ kết thúc phải sau giờ bắt đầu.");
    if (!merged.cover_asset_id && !merged.cover_image_url) throw new AdminApiError("Vui lòng chọn ảnh chương trình.");
    const query = supabase.from("events").update({...payload,updated_by:user.id}).eq("id",id).eq("updated_at",expected || current.data.updated_at);
    const result = await query.select().maybeSingle();
    databaseFailure(result.error);
    if (!result.data) throw new AdminApiError("Sự kiện đã được chỉnh sửa. Vui lòng tải lại trước khi lưu.",409);
    revalidatePath("/"); revalidatePath("/events"); revalidatePath(`/events/${current.data.public_id || id}`);
    return NextResponse.json({item:result.data});
  } catch(error) { return apiFailure(error); }
}
export async function PATCH(request:Request,props:Props) { return mutate(request,props,false); }
export async function DELETE(request:Request,props:Props) { return mutate(request,props,true); }
