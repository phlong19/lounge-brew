import {contentEntry,contentEnvelope,commitContent} from "@/lib/server/content-lifecycle";
import { drainMediaDeletionJobs } from "@/lib/server/media-cleanup";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { AdminApiError, apiFailure, assertSameOrigin, databaseFailure, eventId, readJson, resolveEventCover, requireContentStaff } from "@/lib/server/admin-api";
import { eventPayload } from "@/lib/admin/event-validation";
export const maxDuration=60;
type Props = {params:Promise<{id:string}>};
export async function GET(request: Request, {params}:Props) {
  try {
    const {supabase} = await requireContentStaff(request);
    const id = eventId((await params).id);
    const result = await supabase.from("admin_content_entries").select("*").eq("kind","event").eq("id",id).maybeSingle();
    databaseFailure(result.error);
    if (!result.data) throw new AdminApiError("Không tìm thấy sự kiện.",404);
    return NextResponse.json({item:contentEntry(result.data)},{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return apiFailure(error); }
}
async function mutate(request:Request, props:Props) {
  try {
    assertSameOrigin(request);
    const {supabase} = await requireContentStaff(request);
    const id = eventId((await props.params).id);
    const raw = await readJson(request);
    const payload = eventPayload(contentEnvelope(raw).data,true);
    await resolveEventCover(supabase,payload);
    const expected = typeof raw.expectedUpdatedAt === "string" ? raw.expectedUpdatedAt : null;
    const current = await supabase.from("events").select("*").eq("id",id).maybeSingle();
    databaseFailure(current.error);
    if (!current.data || (current.data.is_deleted && payload.is_deleted !== false)) throw new AdminApiError("Không tìm thấy sự kiện.",404);
    if ("source_id" in payload && payload.source_id !== current.data.source_id) throw new AdminApiError("Không thể thay đổi mã nguồn của sự kiện đã tạo.");
    const merged = {...current.data,...payload};
    if (merged.end_date && Date.parse(merged.end_date) < Date.parse(merged.event_date)) throw new AdminApiError("Giờ kết thúc phải sau giờ bắt đầu.");
    if (!merged.cover_asset_id && !merged.cover_image_url) throw new AdminApiError("Vui lòng chọn ảnh chương trình.");
    const item=await commitContent(supabase,"event",id,payload,{...raw,expectedUpdatedAt:expected||current.data.updated_at});
    revalidateTag("upcoming-events",{expire:0}); revalidatePath("/"); revalidatePath("/events"); revalidatePath(`/events/${current.data.public_id || id}`);
    return NextResponse.json({item});
  } catch(error) { return apiFailure(error); }
}
export async function PATCH(request:Request,props:Props) { return mutate(request,props); }
export async function DELETE(request:Request,props:Props) {
 try {
  assertSameOrigin(request);
  const {supabase}=await requireContentStaff(request);
  if(!createSupabaseAdminClient())throw new AdminApiError("Chưa cấu hình xóa ảnh trên máy chủ.",503);
  const id=eventId((await props.params).id);
  const raw=await readJson(request);
  if(typeof raw.expectedUpdatedAt!=="string"||!Number.isFinite(Date.parse(raw.expectedUpdatedAt)))throw new AdminApiError("Vui lòng tải lại sự kiện trước khi xóa.",409);
  const result=await supabase.rpc("delete_event_with_session",{p_event_id:id,p_expected_updated_at:raw.expectedUpdatedAt,p_session:raw.media_session?eventId(raw.media_session):null});
  if(result.error?.code==="23503")throw new AdminApiError("Sự kiện đã có yêu cầu đặt bàn. Hãy ẩn sự kiện để giữ thông tin đặt bàn.",409);
  if(result.error?.code==="40001")throw new AdminApiError("Sự kiện đã thay đổi. Vui lòng tải lại trước khi xóa.",409);
  if(result.error?.code==="P0002")throw new AdminApiError("Không tìm thấy sự kiện.",404);
  databaseFailure(result.error);
  revalidateTag("upcoming-events",{expire:0});revalidatePath("/");revalidatePath("/events");revalidatePath(`/events/${result.data||id}`);
  let pending=true;
  try {pending=(await drainMediaDeletionJobs())>0;} catch { /* durable jobs retry on the next upload/deletion */ }
  return NextResponse.json({deleted:true,mediaCleanupPending:pending});
 }catch(error){return apiFailure(error);}
}
