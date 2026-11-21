import {AdminReservations} from "@/components/admin/admin-reservations";
import {Typography} from "@/components/ui/typography";
import {Stack} from "@/components/ui/layout";
export default function ReservationsPage(){return <Stack gap="lg"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">Đặt bàn</Typography><AdminReservations /></Stack>}
