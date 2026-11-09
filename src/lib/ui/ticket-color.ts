import { ticketPalette } from "@/lib/ui/ticket-palettes";

export function normalizeTicketColor(value: unknown): string | null {
 return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
}
/** Palette stocks are compile-time constants; custom colours must be six-digit hex. */
export function ticketBackground(value?: string | null): string {
 return normalizeTicketColor(value) ?? ticketPalette(value)?.stock.match(/bg-\[(#[0-9A-F]{6})\]/i)?.[1] ?? "#41494A";
}
export function ticketInk(background: string): string {
 const hex=normalizeTicketColor(background) ?? "#41494A";
 const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 const luminance=channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
 return luminance>0.179 ? "#000000" : "#FFFFFF";
}
