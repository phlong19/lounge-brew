import { getLocale } from "next-intl/server";
import { ReservationDialog } from "@/components/lounge/reservation-dialog";
import { shortEventDate } from "@/components/lounge/event-grid";
import type { AppLocale } from "@/i18n/config";
import { localizeEvents } from "@/lib/menu/map-menu";
import { getLoungeData } from "@/lib/server/lounge-data";
import { venueNow } from "@/lib/reservations/validation";

export async function ReservationDialogData() {
  const [locale, data] = await Promise.all([getLocale(), getLoungeData()]);
  const events = localizeEvents(locale as AppLocale, data.events).map(event => ({
    id: event.id,
    label: `${event.performerName} · ${shortEventDate(event.eventDate, locale as AppLocale)}`,
    date: venueNow(new Date(event.eventDate)).date,
    time: venueNow(new Date(event.eventDate)).time,
  }));
  return <ReservationDialog today={venueNow().date} events={events} />;
}
