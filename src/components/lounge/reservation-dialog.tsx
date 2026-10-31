"use client";

import {PublicQueryState} from "@/components/lounge/public-query-state";
import {useQuery} from "@tanstack/react-query";
import {publicEventsOptions} from "@/lib/public/query";
import {bookableEvents} from "@/lib/server/content-policy";
import {localizeEvent} from "@/lib/menu/map-menu";
import {venueNow} from "@/lib/reservations/validation";
import {formatDate} from "@/lib/dates";
import type {AppLocale} from "@/i18n/config";
import { useEffect } from "react";
import {useLocale,useTranslations} from "next-intl";
import { ReservationForm } from "@/components/lounge/reservation-form";
import { useReservation } from "@/components/lounge/reservation-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Surface } from "@/components/ui/layout";
import { reservationStyles } from "@/lib/ui/home-styles";

export function ReservationDialog({ today }: { today: string }) {
  const locale=useLocale() as AppLocale;
  const t = useTranslations("Reservation");
  const { open, eventId, setOpen, openReservation, returnFocus } = useReservation();
  const query=useQuery({...publicEventsOptions(),enabled:open});
  const events=bookableEvents(query.data??[]).map(row=>{const event=localizeEvent(locale,row);const date=venueNow(new Date(event.eventDate));return {id:event.id,startsAt:event.eventDate,label:`${event.performerName} · ${formatDate(event.eventDate)}`,date:date.date,time:date.time};});


  useEffect(() => {
    const openFromHash = () => { if (window.location.hash === "#reservation") openReservation(); };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openReservation]);
  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next && window.location.hash === "#reservation") window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }
  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogContent aria-describedby={undefined} closeLabel={t("close")} className={reservationStyles.dialog} onCloseAutoFocus={event => {
      event.preventDefault();
      const trigger = returnFocus.current;
      if (trigger?.isConnected && trigger !== document.body && trigger.getClientRects().length) trigger.focus();
      else Array.from(document.querySelectorAll<HTMLElement>("[data-reservation-focus-fallback]")).find(node => node.getClientRects().length)?.focus();
    }}>
      <DialogHeader className={reservationStyles.header}><DialogTitle>{t("reviewTitle")}</DialogTitle></DialogHeader>
      <Surface className={reservationStyles.body}>{query.data===undefined?<PublicQueryState error={query.isError} english={locale==="en"} retry={()=>void query.refetch()} />:null}<ReservationForm key={eventId ?? "general"} today={today} events={events} initialEventId={eventId} /></Surface>
    </DialogContent>
  </Dialog>;
}
