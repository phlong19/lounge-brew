import {NextResponse} from "next/server";
import {AdminApiError,apiFailure,assertSameOrigin,readJson,requireAdmin,databaseFailure} from "@/lib/server/admin-api";
import {isStrongStaffPassword,staffPasswordHint} from "@/lib/admin/staff-validation";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 assertSameOrigin(request);const {supabase,user}=await requireAdmin(request),id=(await params).id;
 if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)||id===user.id)throw new AdminApiError("Không thể thay đổi tài khoản này.",403);
 const body=await readJson(request,2048);
 if(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).some(key=>!["action","isActive","expectedActive","password"].includes(key))||!["access","password"].includes(body.action))throw new AdminApiError("Dữ liệu không hợp lệ.");
 const target=await supabase.from("staff_members").select("user_id,role,is_active").eq("user_id",id).maybeSingle();databaseFailure(target.error);
 if(!target.data)throw new AdminApiError("Không tìm thấy nhân viên.",404);
 if(target.data.role==="admin")throw new AdminApiError("Không thể thay đổi quản trị viên từ danh sách nhân viên.",403);
 const service=createSupabaseAdminClient();if(!service)throw new AdminApiError("Chưa cấu hình quản lý tài khoản.",503);
 let action:string,warning="";
 if(body.action==="access"){
  if(typeof body.isActive!=="boolean"||typeof body.expectedActive!=="boolean"||body.isActive===body.expectedActive||"password" in body)throw new AdminApiError("Trạng thái không hợp lệ.");
  if(target.data.is_active!==body.expectedActive)throw new AdminApiError("Trạng thái đã thay đổi. Vui lòng tải lại.",409);
  // Disable app permissions before any external Auth work. Re-enabling never leaves Auth banned.
  if(body.isActive){const result=await service.auth.admin.updateUserById(id,{ban_duration:"none"});if(result.error)throw new AdminApiError("Chưa thể mở lại tài khoản.",503);}
  const updated=await supabase.from("staff_members").update({is_active:body.isActive}).eq("user_id",id).eq("is_active",body.expectedActive).neq("role","admin").select("user_id").maybeSingle();databaseFailure(updated.error);if(!updated.data)throw new AdminApiError("Trạng thái đã thay đổi. Vui lòng tải lại.",409);
  if(!body.isActive){const result=await service.auth.admin.updateUserById(id,{ban_duration:"876000h"});if(result.error)warning="Đã khóa quyền ứng dụng; chưa đồng bộ được khóa đăng nhập Supabase.";}
  action=body.isActive?"staff.access_enabled":"staff.access_disabled";
 }else{
  if("isActive" in body||"expectedActive" in body||!isStrongStaffPassword(body.password))throw new AdminApiError(staffPasswordHint);
  const result=await service.auth.admin.updateUserById(id,{password:body.password});if(result.error)throw new AdminApiError("Không thể đổi mật khẩu. Vui lòng thử mật khẩu khác hoặc thử lại.",400);
  action="staff.password_changed";
 }
 const ended=await service.rpc("finish_staff_security_action",{p_target:id,p_actor:user.id,p_action:action});
 if(ended.error)throw new AdminApiError("Thay đổi đã được lưu nhưng chưa kết thúc được mọi phiên đăng nhập. Vui lòng thử lại.",503);
 return NextResponse.json({ok:true,warning},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}}
