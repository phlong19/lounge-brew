import {AdminSeating} from "@/components/admin/admin-seating";
import {Typography} from "@/components/ui/typography";
import {Stack} from "@/components/ui/layout";
export default function SeatingPage(){return <Stack gap="lg"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">Sơ đồ chỗ ngồi</Typography><AdminSeating /></Stack>}
