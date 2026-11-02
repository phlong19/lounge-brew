import {isCalendarDate} from "@/lib/dates";
import {NextResponse} from "next/server";
import {requireStaff,readJson,assertSameOrigin,apiFailure,AdminApiError} from "@/lib/server/admin-api";
import {reservationInput,ReservationInputError} from "@/lib/reservations/input";
import {isReservationStatus,isReservationSource} from "@/lib/reservations/model";
import {reservationSelect,resolveReservation,reservationDatabaseError,privateReservationHeaders} from "@/lib/server/reservations";
export async function GET(request:Request){try{
 const {supabase}=await requireStaff(request),params=new URL(request.url).searchParams;
 const page=Math.max(1,Math.min(10000,Number(params.get("page"))||1)),limit=20;
 let query=supabase.from("reservations").select(reservationSelect,{count:"exact"});
 const status=params.get("status")??"pending",source=params.get("source");
 if(status!=="all"){if(!isReservationStatus(status))throw new AdminApiError("Trạng thái không hợp lệ.");query=query.eq("status",status);}
 if(source&&source!=="all"){if(!isReservationSource(source))throw new AdminApiError("Nguồn không hợp lệ.");query=query.eq("source",source);}
 const date=params.get("date"),event=params.get("event");
 if(date){if(!isCalendarDate(date))throw new AdminApiError("Ngày không hợp lệ.");query=query.eq("visit_date",date);}
 if(event){const programme=await supabase.from("events").select("id").eq("public_id",event).maybeSingle();reservationDatabaseError(programme.error);if(!programme.data)return NextResponse.json({items:[],total:0,page,limit},{headers:privateReservationHeaders()});query=query.eq("event_id",programme.data.id);}
 const search=(params.get("search")??"").replace(/[^\p{L}\p{N} +\-]/gu,"").trim().slice(0,100);
 if(search){const phone=/^[+\d .()\-]+$/.test(search)?search.replace(/\D/g,"").replace(/^0084/,"84"):"";query=query.or(`name.ilike.%${search}%${phone?`,phone_normalized.ilike.%${phone.replace(/^0/,"")}%`:""}`);}
 const result=await query.order("created_at",{ascending:status==="pending"}).range((page-1)*limit,page*limit-1).abortSignal(AbortSignal.timeout(8000));
 reservationDatabaseError(result.error);
 return NextResponse.json({items:result.data,total:result.count??0,page,limit},{headers:privateReservationHeaders()});
 }catch(error){return apiFailure(error);}}
export async function POST(request:Request){try{
 assertSameOrigin(request);const {supabase,user}=await requireStaff(request),parsed=reservationInput(await readJson(request,8192),true);
 const existing=await supabase.from("reservations").select(reservationSelect).eq("idempotency_key",parsed.idempotencyKey).maybeSingle();reservationDatabaseError(existing.error);
 if(existing.data)return NextResponse.json({item:existing.data},{headers:privateReservationHeaders()});
 const payload=await resolveReservation(supabase,parsed.values);
 const result=await supabase.from("reservations").insert({...payload,idempotency_key:parsed.idempotencyKey,status:parsed.status,source:parsed.source,updated_by:user.id}).select(reservationSelect).single();
 reservationDatabaseError(result.error);return NextResponse.json({item:result.data},{status:201,headers:privateReservationHeaders()});
 }catch(error){if(error instanceof ReservationInputError)return NextResponse.json({error:"Vui lòng kiểm tra thông tin đặt bàn.",fields:error.fields},{status:400});return apiFailure(error);}}
