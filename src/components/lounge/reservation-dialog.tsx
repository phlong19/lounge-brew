"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ReservationForm, type EventChoice } from "@/components/lounge/reservation-form";
import { useReservation } from "@/components/lounge/reservation-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Surface } from "@/components/ui/layout";
import { reservationStyles } from "@/lib/ui/home-styles";

export function ReservationDialog({ today, events }: { today: string; events: EventChoice[] }) {
  const t = useTranslations("Reservation");
  const { open, eventId, setOpen, openReservation, returnFocus } = useReservation();
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
      <DialogHeader className={reservationStyles.header}><DialogTitle>{t("title")}</DialogTitle></DialogHeader>
      <Surface className={reservationStyles.body}><ReservationForm key={eventId ?? "general"} today={today} events={events} initialEventId={eventId} /></Surface>
    </DialogContent>
  </Dialog>;
}
