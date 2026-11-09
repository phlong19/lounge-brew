import {NextResponse} from "next/server";
import {apiFailure,assertSameOrigin,readJson,requireContentStaff,databaseFailure,AdminApiError,eventId} from "@/lib/server/admin-api";
import {draftPayload} from "@/lib/admin/draft-validation";
import {cleanupAfterResponse,contentEntry} from "@/lib/server/content-lifecycle";
import type {Json} from "@/types/database";
export async function POST(request:Request){try{
 assertSameOrigin(request);const {supabase}=await requireContentStaff(request);const raw=await readJson(request);
 if(!['event','article'].includes(raw.kind)||!raw.data||typeof raw.data!=="object"||Array.isArray(raw.data))throw new AdminApiError("Bản nháp không hợp lệ.");
 const data=draftPayload(raw.kind,raw.data);
 const result=await supabase.rpc("save_content_draft",{p_id:raw.id?eventId(raw.id):null,p_kind:raw.kind,p_data:data,p_expected:raw.expectedUpdatedAt??null,p_session:raw.media_session?eventId(raw.media_session):null});
 if(result.error?.code==='40001')throw new AdminApiError("Bản nháp đã thay đổi. Vui lòng tải lại.",409);databaseFailure(result.error);cleanupAfterResponse();
 const row=result.data as {id:string;data:Json;updated_at:string};return NextResponse.json({item:contentEntry({...row,is_draft:true})});
 }catch(error){return apiFailure(error);}}
export async function DELETE(request:Request){try{
 assertSameOrigin(request);const {supabase}=await requireContentStaff(request);const raw=await readJson(request);
 if(raw.id){const result=await supabase.rpc("delete_content_draft",{p_id:eventId(raw.id),p_expected:raw.expectedUpdatedAt,p_session:raw.media_session?eventId(raw.media_session):null});databaseFailure(result.error);}
 else {const result=await supabase.rpc("release_media_session",{p_session:eventId(raw.media_session)});databaseFailure(result.error);}
 cleanupAfterResponse();return NextResponse.json({ok:true});
 }catch(error){return apiFailure(error);}}
