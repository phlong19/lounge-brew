import {notFound} from "next/navigation";
import {AdminDesign} from "@/components/admin/admin-design";
import {requireStaff} from "@/lib/server/admin-api";
export default async function StaffPage() {
 const {user,role,displayName}=await requireStaff();
 if(role!=="admin")notFound();
 return <AdminDesign events={[]} initialSection="staff" staff={{email:user.email??"",name:displayName,role}} />;
}
