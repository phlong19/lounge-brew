import type {StaffRole} from "@/lib/admin/roles";
export type NewStaff = {display_name:string;email:string;password:string;role:StaffRole};
export class StaffInputError extends Error {}
export const staffPasswordPattern = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s])\\S{8,22}";
export const staffPasswordHint = "8–22 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt; không chứa khoảng trắng.";
export function isStrongStaffPassword(value: unknown): value is string {
 return typeof value === "string" && value.length >= 8 && value.length <= 22 && new RegExp("^(?:" + staffPasswordPattern + ")$").test(value);
}
export function staffInput(input:unknown):NewStaff {
 if(!input||typeof input!=="object"||Array.isArray(input))throw new StaffInputError("Thông tin nhân viên không hợp lệ.");
 const body=input as Record<string,unknown>;
 if(Object.keys(body).some(key=>!["display_name","email","password","role"].includes(key)))throw new StaffInputError("Thông tin nhân viên có trường không hợp lệ.");
 if(typeof body.display_name!=="string"||!body.display_name.trim()||body.display_name.trim().length>120||/[\u0000-\u001f\u007f]/.test(body.display_name))throw new StaffInputError("Nhập tên nhân viên từ 1 đến 120 ký tự.");
 if(typeof body.email!=="string"||body.email.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))throw new StaffInputError("Email không hợp lệ.");
 if(!isStrongStaffPassword(body.password))throw new StaffInputError("Mật khẩu cần "+staffPasswordHint);
 if(body.role!=="admin"&&body.role!=="editor")throw new StaffInputError("Vai trò không hợp lệ.");
 return {display_name:body.display_name.trim(),email:body.email.trim().toLowerCase(),password:body.password,role:body.role};
}
