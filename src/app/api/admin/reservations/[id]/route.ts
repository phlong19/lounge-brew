import {NextResponse} from "next/server";
import {requireStaff,readJson,assertSameOrigin,apiFailure,AdminApiError,eventId} from "@/lib/server/admin-api";
import {isReservationStatus,reservationTransitions} from "@/lib/reservations/model";
import {reservationSelect,reservationDatabaseError,privateReservationHeaders} from "@/lib/server/reservations";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){try{
 const {supabase}=await requireStaff(request),id=eventId((await context.params).id);
 const item=await supabase.from("reservations").select(reservationSelect).eq("id",id).maybeSingle();reservationDatabaseError(item.error);if(!item.data)throw new AdminApiError("Không tìm thấy đặt bàn.",404);
 const audit=await supabase.from("audit_log").select("id,action,actor_id,created_at,old_data,new_data,changed_fields").eq("table_name","reservations").eq("record_id",id).order("created_at",{ascending:false}).limit(100);reservationDatabaseError(audit.error);
 const ids=[...new Set((audit.data??[]).flatMap(row=>row.actor_id?[row.actor_id]:[]))];
 const names=new Map<string,string>();
 if(ids.length){const service=createSupabaseAdminClient();if(!service)throw new AdminApiError("Không thể tải người thực hiện.",503);const actors=await service.from("staff_members").select("user_id,display_name").in("user_id",ids);reservationDatabaseError(actors.error);actors.data?.forEach(actor=>names.set(actor.user_id,actor.display_name));}
 const history=(audit.data??[]).map(row=>({id:row.id,action:row.action,actor_name:row.actor_id?(names.get(row.actor_id)??"Nhân viên"):"Khách / hệ thống",created_at:row.created_at,previous_status:(row.old_data as {status?:string}|null)?.status??null,new_status:(row.new_data as {status?:string}|null)?.status??null,changed_fields:row.changed_fields}));
 return NextResponse.json({item:item.data,history},{headers:privateReservationHeaders()});
 }catch(error){return apiFailure(error);}}
export async function PATCH(request:Request,context:Context){try{
 assertSameOrigin(request);const {supabase,user}=await requireStaff(request),id=eventId((await context.params).id),body=await readJson(request,2048);
 if(!body||Object.keys(body).some(key=>!["status","expectedUpdatedAt"].includes(key))||!isReservationStatus(body.status)||typeof body.expectedUpdatedAt!=="string")throw new AdminApiError("Dữ liệu không hợp lệ.");
 const current=await supabase.from("reservations").select("status,updated_at").eq("id",id).maybeSingle();reservationDatabaseError(current.error);
 if(!current.data)throw new AdminApiError("Không tìm thấy đặt bàn.",404);
 if(!isReservationStatus(current.data.status)||!reservationTransitions(current.data.status).includes(body.status)||current.data.updated_at!==body.expectedUpdatedAt)throw new AdminApiError("Đặt bàn đã thay đổi. Vui lòng tải lại trước khi cập nhật.",409);
 const result=await supabase.from("reservations").update({status:body.status,updated_by:user.id}).eq("id",id).eq("updated_at",body.expectedUpdatedAt).select(reservationSelect).maybeSingle();reservationDatabaseError(result.error);
 if(!result.data)throw new AdminApiError("Đặt bàn đã được người khác cập nhật. Vui lòng tải lại.",409);
 return NextResponse.json({item:result.data},{headers:privateReservationHeaders()});
 }catch(error){return apiFailure(error);}}
