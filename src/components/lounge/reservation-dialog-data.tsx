import {ReservationDialog} from "@/components/lounge/reservation-dialog";
import {PublicDataBoundary} from "@/components/lounge/public-data-boundary";
import {venueNow} from "@/lib/reservations/validation";
export function ReservationDialogData(){return <PublicDataBoundary><ReservationDialog today={venueNow().date} /></PublicDataBoundary>;}
