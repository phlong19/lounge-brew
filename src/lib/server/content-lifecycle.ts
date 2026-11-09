import "server-only";
import {after} from "next/server";
import {AdminApiError,databaseFailure,eventId,type requireContentStaff} from "@/lib/server/admin-api";
import {drainMediaDeletionJobs} from "@/lib/server/media-cleanup";
import type {Json} from "@/types/database";
type Client=Awaited<ReturnType<typeof requireContentStaff>>["supabase"];
export function contentEnvelope(raw:Record<string,unknown>){
 const {media_session,draft_id,...data}=raw;
 return {data,session:media_session==null?null:eventId(String(media_session)),draft:draft_id==null?null:eventId(String(draft_id))};
}
export function cleanupAfterResponse(){after(async()=>{try{await drainMediaDeletionJobs();}catch{/* Durable jobs retry on later operations. */}});}
export function contentEntry(row:{id:string;data:Json;is_draft:boolean;updated_at:string}){
 const data=row.data as Record<string,unknown>;
 return {...(row.is_draft?{title_vi:"",title_en:"",performer_name:"",event_date:"",content_vi:"",content_en:"",slug:"",cover_image_url:null,thumbnail_url:null,published_at:null,is_active:false}:{}),...Object.fromEntries(Object.entries(data).filter(([,value])=>value!==null)),id:row.id,is_draft:row.is_draft,updated_at:row.updated_at};
}
export async function commitContent(client:Client,kind:string,id:string|null,data:Record<string,unknown>,raw:Record<string,unknown>){
 const envelope=contentEnvelope(raw);
 const result=await client.rpc("commit_content",{p_kind:kind,p_id:id,p_data:data as Json,p_expected:typeof raw.expectedUpdatedAt==="string"?raw.expectedUpdatedAt:null,p_draft:envelope.draft,p_session:envelope.session});
 if(result.error?.code==="40001")throw new AdminApiError("Nội dung đã thay đổi. Vui lòng tải lại.",409);
 databaseFailure(result.error);cleanupAfterResponse();return result.data as Record<string,unknown>;
}
