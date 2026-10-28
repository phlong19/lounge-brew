"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";

type ReservationContextValue = {
  open: boolean;
  eventId?: string;
  openReservation: (eventId?: string, trigger?: HTMLElement) => void;
  setOpen: (open: boolean) => void;
  returnFocus: RefObject<HTMLElement | null>;
};
const ReservationContext = createContext<ReservationContextValue | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState<string>();
  const returnFocus = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);
  const openReservation = useCallback((id?: string, trigger?: HTMLElement) => {
    returnFocus.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setEventId(id);
    setOpen(true);
  }, []);
  return <ReservationContext.Provider value={{ open, eventId, openReservation, setOpen, returnFocus }}>{children}</ReservationContext.Provider>;
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) throw new Error("Reservation controls require ReservationProvider.");
  return context;
}

export function ReservationButton({ eventId, onClick, ...props }: Omit<ButtonProps, "asChild"> & { eventId?: string }) {
  const { openReservation } = useReservation();
  return <Button {...props} aria-haspopup="dialog" onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) openReservation(eventId, event.currentTarget);
  }} />;
}
