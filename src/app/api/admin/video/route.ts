import {NextResponse} from "next/server";
import {revalidatePath,revalidateTag} from "next/cache";
import {AdminApiError,apiFailure,assertSameOrigin,readJson,requireContentStaff,databaseFailure} from "@/lib/server/admin-api";
import {videoInput,VideoInputError,videoSelect} from "@/lib/video";
export async function GET(request:Request){try{
 const {supabase}=await requireContentStaff(request);
 const result=await supabase.from("video_settings").select(videoSelect).eq("id","home").abortSignal(AbortSignal.timeout(5000)).maybeSingle();databaseFailure(result.error);
 if(!result.data)throw new AdminApiError("Chưa khởi tạo cấu hình video.",503);
 return NextResponse.json({item:result.data},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){return apiFailure(error);}}
export async function PATCH(request:Request){try{
 assertSameOrigin(request);const {supabase,user}=await requireContentStaff(request);
 const {expectedUpdatedAt,...payload}=videoInput(await readJson(request,8192));
 const result=await supabase.from("video_settings").update({...payload,updated_by:user.id}).eq("id","home").eq("updated_at",expectedUpdatedAt).select(videoSelect).abortSignal(AbortSignal.timeout(5000)).maybeSingle();databaseFailure(result.error);
 if(!result.data)throw new AdminApiError("Cấu hình đã được người khác thay đổi. Vui lòng tải lại trước khi lưu.",409);
 revalidateTag("video-settings",{expire:0});revalidatePath("/");
 return NextResponse.json({item:result.data},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){if(error instanceof VideoInputError)return NextResponse.json({error:error.message},{status:400});return apiFailure(error);}}
