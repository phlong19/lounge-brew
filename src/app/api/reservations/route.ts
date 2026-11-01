import {NextResponse} from "next/server";
import {AdminApiError,assertSameOrigin,readJson} from "@/lib/server/admin-api";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {reservationInput,ReservationInputError} from "@/lib/reservations/input";
import {resolveReservation,reservationFingerprint,reservationAbuseKeys} from "@/lib/server/reservations";
export const runtime="nodejs";
const respond=(data:object,status:number)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store",...(status===429?{"Retry-After":"3600"}:{})}});
export async function POST(request:Request){
 try{
  assertSameOrigin(request);const parsed=reservationInput(await readJson(request,8192));
  const client=createSupabaseAdminClient();if(!client)return respond({error:"submitUnavailable"},503);
  const values=await resolveReservation(client,parsed.values,true),keys=reservationAbuseKeys(request,values.phone);
  const result=await client.rpc("submit_reservation_request",{p_key:parsed.idempotencyKey,p_fingerprint:reservationFingerprint(values),p_ip_hash:keys.ip,p_phone_hash:keys.phone,p_shared_ip:keys.shared,p_event_id:values.event_id!,p_name:values.name,p_phone:values.phone,p_email:values.email!,p_visit_date:values.visit_date,p_visit_time:values.visit_time,p_guests:values.guests,p_notes:values.notes}).abortSignal(AbortSignal.timeout(12000));
  if(result.error)return respond({error:"submitUnavailable"},503);
  if(result.data==="received")return respond({received:true},202);
  if(result.data==="rate_limited")return respond({error:"rateLimited"},429);
  if(result.data==="conflict")return respond({error:"requestChanged"},409);
  return respond({error:"visitChanged"},422);
 }catch(error){
  if(error instanceof ReservationInputError)return respond({error:"inputInvalid",fields:error.fields},400);
  if(error instanceof AdminApiError)return respond({error:error.status===503?"submitUnavailable":"inputInvalid"},error.status);
  console.error("Reservation submit failed");return respond({error:"submitUnavailable"},503);
 }
}
