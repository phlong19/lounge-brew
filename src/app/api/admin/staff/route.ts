import {NextResponse} from "next/server";
import {AdminApiError,apiFailure,assertSameOrigin,databaseFailure,readJson,requireAdmin} from "@/lib/server/admin-api";
import {StaffInputError,staffInput} from "@/lib/admin/staff-validation";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
const fields="user_id,display_name,role,is_active,created_at";
export async function GET(request:Request) {
 try {
  const {supabase}=await requireAdmin(request);
  const params=new URL(request.url).searchParams;
  const page=Math.min(10000,Math.max(1,Math.floor(Number(params.get("page"))||1)));
  const search=(params.get("search")??"").trim().slice(0,120),status=params.get("status")??"all";
  if(!["all","active","inactive"].includes(status))throw new AdminApiError("Trạng thái không hợp lệ.");
  const result=await supabase.rpc("admin_staff_directory",{p_search:search,p_status:status,p_page:page});
  databaseFailure(result.error);
  return NextResponse.json(result.data,{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
export async function POST(request:Request) {
 try {
  assertSameOrigin(request);
  const {supabase}=await requireAdmin(request);
  let input;
  try {input=staffInput(await readJson(request));}
  catch(error){if(error instanceof StaffInputError)throw new AdminApiError(error.message);throw error;}
  const client=createSupabaseAdminClient();
  if(!client)throw new AdminApiError("Chưa cấu hình dịch vụ tạo tài khoản.",503);
  const created=await client.auth.admin.createUser({email:input.email,password:input.password,email_confirm:true,user_metadata:{full_name:input.display_name}});
  if(created.error||!created.data.user){
   if(["email_exists","user_already_exists"].includes(created.error?.code||""))throw new AdminApiError("Email này đã có tài khoản.",409);
   throw new AdminApiError("Không thể tạo tài khoản. Kiểm tra email và mật khẩu hoặc thử lại.",created.error?.status===429?429:400);
  }
  const result=await supabase.from("staff_members").insert({user_id:created.data.user.id,display_name:input.display_name,role:input.role,is_active:true}).select(fields).single();
  if(result.error){
   const cleanup=await client.auth.admin.deleteUser(created.data.user.id);
   if(cleanup.error)console.error("Staff provisioning cleanup failed");
   databaseFailure(result.error);
  }
  return NextResponse.json({item:result.data},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
