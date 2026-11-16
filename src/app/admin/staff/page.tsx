import {notFound} from "next/navigation";
import {requireStaff} from "@/lib/server/admin-api";
import {AdminStaff} from "@/components/admin/admin-staff";
import {Typography} from "@/components/ui/typography";
import {Stack} from "@/components/ui/layout";
export default async function StaffPage(){const {role}=await requireStaff();if(role!=="admin")notFound();return <Stack gap="lg"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">Nhân viên</Typography><AdminStaff /></Stack>}
