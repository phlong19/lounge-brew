import {AdminDesign} from "@/components/admin/admin-design";
import {requireStaff} from "@/lib/server/admin-api";
export default async function AdminPage({searchParams}:{searchParams:Promise<{section?:string}>}) {
 const {user,role,displayName}=await requireStaff();
 const section=(await searchParams).section;
 const initialSection=section==="video"||section==="seating"?section:"events";
 return <AdminDesign events={[]} key={initialSection} initialSection={initialSection} staff={{email:user.email??"",name:displayName,role}} />;
}
