import { Slot } from "@radix-ui/react-slot";
import type { ReactElement } from "react";
import { normalizeTicketColor, ticketInk } from "@/lib/ui/ticket-color";

/** User-approved exception: validated ticket stock and contrast-safe ink only. */
export function TicketPaper({color,children}:{color?:string|null;children:ReactElement}) {
 const safeBackground=normalizeTicketColor(color);
 const safeInk=ticketInk(safeBackground??"#41494A");
 return safeBackground ? <Slot style={{backgroundColor:safeBackground,color:safeInk}}>{children}</Slot> : children;
}
