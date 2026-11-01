import {NextResponse} from "next/server";
import {requireStaff,apiFailure} from "@/lib/server/admin-api";
import {reservationDatabaseError,privateReservationHeaders} from "@/lib/server/reservations";
export async function GET(request:Request){try{
 const {supabase}=await requireStaff(request);
 const [count,latest]=await Promise.all([supabase.from("reservations").select("id",{count:"exact",head:true}).eq("status","pending"),supabase.from("reservations").select("id,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle()]);
 reservationDatabaseError(count.error);reservationDatabaseError(latest.error);
 return NextResponse.json({pending:count.count??0,latest:latest.data},{headers:privateReservationHeaders()});
 }catch(error){return apiFailure(error);}}
