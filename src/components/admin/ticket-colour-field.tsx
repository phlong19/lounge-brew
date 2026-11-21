"use client";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Inline } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import { ticketPalette } from "@/lib/ui/ticket-palettes";
import { ticketBackground } from "@/lib/ui/ticket-color";
export function TicketColourField({detected,override,disabled,onChange}:{detected?:string|null;override?:string|null;disabled:boolean;onChange:(color:string|null)=>void}) {
 const current=ticketBackground(override??detected);
 const unavailable=disabled||!ticketPalette(detected);
 return <Field><Label htmlFor="event-ticket-colour">Màu vé</Label><Inline gap="xs" className="flex-nowrap">
  <Input type="color" id="event-ticket-colour" value={current} onInput={event=>onChange(event.currentTarget.value)} onChange={event=>onChange(event.target.value)} disabled={unavailable} className="h-10 min-w-0 flex-1 cursor-pointer p-1 disabled:cursor-not-allowed" aria-describedby="event-ticket-colour-help" />
  <Button variant="outline" size="icon" disabled={unavailable||!override} onClick={()=>onChange(null)} aria-label="Đặt lại màu theo ảnh bìa" title="Đặt lại màu theo ảnh bìa"><Icon name="reset" /></Button>
 </Inline><Typography id="event-ticket-colour-help" variant="caption" tone="muted">{unavailable?'Tải ảnh bìa để chọn màu vé.':override?`Màu tùy chỉnh · ${current}`:'Tự nhận diện từ ảnh bìa.'}</Typography></Field>;
}
