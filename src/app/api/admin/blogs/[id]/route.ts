import {NextResponse} from "next/server";
import {revalidatePath} from "next/cache";
import {AdminApiError,apiFailure,assertSameOrigin,databaseFailure,eventId,readJson,requireContentStaff} from "@/lib/server/admin-api";
import {blogPayload} from "@/lib/admin/blog-validation";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){try{
 const {supabase}=await requireContentStaff(request);const id=eventId((await params).id);
 const result=await supabase.from("articles").select().eq("id",id).maybeSingle();databaseFailure(result.error);if(!result.data)throw new AdminApiError("Không tìm thấy bài viết.",404);
 return NextResponse.json({item:result.data},{headers:{"Cache-Control":"no-store"}});
}catch(error){return apiFailure(error);}}
export async function PATCH(request:Request,{params}:Context){try{
 assertSameOrigin(request);const {supabase}=await requireContentStaff(request);const id=eventId((await params).id);const raw=await readJson(request);const payload=blogPayload(raw);
 if(!raw.expectedUpdatedAt)throw new AdminApiError("Thiếu phiên bản bài viết.");
 const old=await supabase.from("articles").select("slug").eq("id",id).maybeSingle();databaseFailure(old.error);if(!old.data)throw new AdminApiError("Không tìm thấy bài viết.",404);
 const result=await supabase.from("articles").update(payload).eq("id",id).eq("updated_at",raw.expectedUpdatedAt).select().maybeSingle();databaseFailure(result.error);if(!result.data)throw new AdminApiError("Bài viết đã thay đổi. Vui lòng tải lại.",409);
 revalidatePath("/journal");revalidatePath("/");revalidatePath(`/journal/${old.data.slug}`);revalidatePath(`/journal/${result.data.slug}`);return NextResponse.json({item:result.data});
}catch(error){return apiFailure(error);}}
export async function DELETE(request:Request,{params}:Context){try{
 assertSameOrigin(request);const {supabase}=await requireContentStaff(request);const id=eventId((await params).id);const raw=await readJson(request);
 if(typeof raw.expectedUpdatedAt!=="string"||!Number.isFinite(Date.parse(raw.expectedUpdatedAt)))throw new AdminApiError("Thiếu phiên bản bài viết.");
 const result=await supabase.from("articles").delete().eq("id",id).eq("updated_at",raw.expectedUpdatedAt).select("slug").maybeSingle();databaseFailure(result.error);if(!result.data)throw new AdminApiError("Bài viết đã thay đổi hoặc không tồn tại. Vui lòng tải lại.",409);
 revalidatePath("/journal");revalidatePath("/");revalidatePath(`/journal/${result.data.slug}`);return NextResponse.json({ok:true});
}catch(error){return apiFailure(error);}}
