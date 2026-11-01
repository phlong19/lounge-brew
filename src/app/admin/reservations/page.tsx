import {AdminDesign} from "@/components/admin/admin-design";
import {requireStaff} from "@/lib/server/admin-api";
export default async function ReservationsPage(){const {user,role,displayName}=await requireStaff();return <AdminDesign events={[]} initialSection="reservations" staff={{email:user.email??"",name:displayName,role}} />;}
