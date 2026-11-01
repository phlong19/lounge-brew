import "server-only";
import {createHash,createHmac} from "node:crypto";
import {isIP} from "node:net";
import type {SupabaseClient} from "@supabase/supabase-js";
import type {Database} from "@/types/database";
import {AdminApiError} from "@/lib/server/admin-api";
import {ReservationInputError} from "@/lib/reservations/input";
import {normalizePhone} from "@/lib/reservations/model";
import {isBookableEvent} from "@/lib/server/content-policy";
import {validateReservation,venueNow,type ReservationValues} from "@/lib/reservations/validation";
export const reservationSelect="id,reference,event_id,name,phone,email,visit_date,visit_time,guests,notes,status,source,updated_at,created_at,updated_by,event:events(title_vi,performer_name,public_id)";
export async function resolveReservation(supabase:SupabaseClient<Database>,values:ReservationValues,deferVisitChecks=false){
 let eventId:string|null=null;const events:{id:string;date:string;startsAt:string}[]=[];
 if(values.event){
  const result=await supabase.from("events").select("id,event_date,end_date,is_active,is_deleted").eq("public_id",values.event).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
  if(result.error)throw new AdminApiError("Không thể kiểm tra chương trình.",503);
  if(result.data&&(deferVisitChecks||isBookableEvent(result.data as Parameters<typeof isBookableEvent>[0]))){eventId=result.data.id;events.push({id:values.event,date:venueNow(new Date(result.data.event_date)).date,startsAt:result.data.event_date});}
 }
 const errors=validateReservation(values,new Date(),events,{deferVisitChecks});
 if(Object.keys(errors).length)throw new ReservationInputError(errors);
 return {event_id:eventId,name:values.name,phone:values.phone,email:values.email||null,visit_date:values.date,visit_time:values.time,guests:Number(values.guests),notes:values.notes};
}
export function reservationFingerprint(input:{phone:string;[key:string]:unknown}){return createHash("sha256").update(JSON.stringify({...input,phone:normalizePhone(input.phone)})).digest("hex");}
export function reservationAbuseKeys(request:Request,phone:string){
 const trusted=process.env.VERCEL==="1"||process.env.RESERVATION_TRUST_PROXY==="1";
 const candidate=trusted?(request.headers.get(process.env.VERCEL==="1"?"x-vercel-forwarded-for":"x-forwarded-for")??request.headers.get("x-forwarded-for")??"").split(",")[0].trim().replace(/^::ffff:/,""):"";
 const ip=isIP(candidate)?candidate:"shared";
 const secret=process.env.SUPABASE_SECRET_KEY;if(!secret)throw new AdminApiError("Chưa cấu hình nhận đặt bàn.",503);
 const hash=(kind:string,value:string)=>createHmac("sha256",secret).update("reservations:"+kind+":"+value).digest("hex");
 return {ip:hash("ip",ip),phone:hash("phone",normalizePhone(phone)),shared:ip==="shared"};
}
export function reservationDatabaseError(error:{code?:string}|null){
 if(!error)return;
 if(error.code==="23505")throw new AdminApiError("Số điện thoại đã có yêu cầu đang chờ, hoặc yêu cầu đã được lưu.",409);
 if(["23514","23503","22007","22008"].includes(error.code??""))throw new AdminApiError("Ngày đến, chương trình hoặc trạng thái không còn phù hợp. Vui lòng tải lại.",409);
 if(error.code==="42501")throw new AdminApiError("Không có quyền quản lý đặt bàn.",403);
 throw new AdminApiError("Không thể truy cập đặt bàn. Vui lòng thử lại.",503);
}
export function privateReservationHeaders(){return {"Cache-Control":"private, no-store"};}
