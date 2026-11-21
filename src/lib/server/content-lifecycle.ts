import "server-only";
import {after} from "next/server";
import {AdminApiError,databaseFailure,eventId,type requireContentStaff} from "@/lib/server/admin-api";
import {drainMediaDeletionJobs} from "@/lib/server/media-cleanup";
import type {Json} from "@/types/database";
type Client=Awaited<ReturnType<typeof requireContentStaff>>["supabase"];
export function contentEnvelope(raw:Record<string,unknown>){
 const {media_session,...data}=raw;
 return {data,session:media_session==null?null:eventId(String(media_session))};
}
export function cleanupAfterResponse(){after(async()=>{try{await drainMediaDeletionJobs();}catch{/* Durable jobs retry on later operations. */}});}
export function contentEntry<T extends {status:string}>(row:T){
 const isDraft=row.status==="draft";
 return {...row,...(isDraft?Object.fromEntries(Object.entries(row).map(([key,value])=>[key,value===null&&["event_date","slug"].includes(key)?"":value])):{}),is_draft:isDraft};
}
export async function commitContent(client:Client,kind:string,id:string|null,data:Record<string,unknown>,raw:Record<string,unknown>){
 const envelope=contentEnvelope(raw);
 const result=await client.rpc("commit_content",{p_kind:kind,p_id:id,p_data:data as Json,p_expected:typeof raw.expectedUpdatedAt==="string"?raw.expectedUpdatedAt:null,p_status:"ready",p_session:envelope.session});
 if(result.error?.code==="40001")throw new AdminApiError("Nội dung đã thay đổi. Vui lòng tải lại.",409);
 databaseFailure(result.error);cleanupAfterResponse();return result.data as Record<string,unknown>;
}
