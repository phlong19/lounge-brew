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
  const limit=20;
  const result=await supabase.from("staff_members").select(fields,{count:"exact"}).neq("role","admin").order("created_at",{ascending:false}).order("user_id").range((page-1)*limit,page*limit-1);
  databaseFailure(result.error);
  return NextResponse.json({items:result.data,total:result.count,page,limit},{headers:{"Cache-Control":"no-store"}});
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
