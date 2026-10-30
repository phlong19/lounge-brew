"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Field, Form, Input, Label } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Grid, Inline, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { localDateInput, type EditableEvent } from "@/lib/admin/event-list";
import { adminStyles as s } from "@/lib/ui/admin-styles";

type Props = { event: EditableEvent | null; isNew: boolean; onChange: (event: EditableEvent) => void; onClose: () => void; onApply: (event: EditableEvent) => void; onReturnFocus: () => void };
function EventForm({ event, onChange, onApply }: { event: EditableEvent; onChange: Props["onChange"]; onApply: Props["onApply"] }) {
  const [english, setEnglish] = useState(false);
  const [posterError, setPosterError] = useState("");
  return <Form id="event-editor" className="min-h-0 flex-1 overflow-y-auto p-6" onSubmit={submit => {
    submit.preventDefault();
    if (!event.cover_file && !event.cover_image_url) { setPosterError("Vui lòng chọn ảnh chương trình trước khi lưu."); document.getElementById("event-poster")?.focus(); return; }
    onApply(event);
  }}>
    <Grid className="gap-4 sm:grid-cols-2">
      <Field><Label htmlFor="event-name" required>Tên chương trình</Label><Input id="event-name" required maxLength={200} value={event.title_vi} onChange={input => onChange({ ...event, title_vi: input.target.value })} /></Field>
      <Field><Label htmlFor="artist" required>Nghệ sĩ</Label><Input id="artist" required maxLength={160} value={event.performer_name} onChange={input => onChange({ ...event, performer_name: input.target.value })} /></Field>
    </Grid>
    <Stack gap="sm"><Inline gap="xs"><Button variant="ghost" size="sm" className="h-auto w-fit justify-start p-0 font-normal text-blue-700 underline underline-offset-4 hover:bg-transparent hover:text-blue-800" aria-expanded={english} aria-controls="event-name-en-field" onClick={() => { setEnglish(!english); if (!english) requestAnimationFrame(() => document.getElementById("event-name-en")?.focus()); }}>{english ? "Ẩn tên Tiếng Anh" : "Thêm tên Tiếng Anh"}</Button><TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 rounded-full text-stone-500" aria-label="Tên Tiếng Anh được dùng khi nào?"><Icon name="help" className="size-4" /></Button></TooltipTrigger><TooltipContent className="max-w-72">Tên này được dùng khi khách xem website bằng tiếng Anh.</TooltipContent></Tooltip></TooltipProvider></Inline>{english ? <Field id="event-name-en-field"><Label htmlFor="event-name-en" optionalLabel="không bắt buộc">Tên chương trình tiếng Anh</Label><Input id="event-name-en" value={event.title_en || ""} onChange={input => onChange({ ...event, title_en: input.target.value })} /></Field> : null}</Stack>
    <Grid className="gap-4 sm:grid-cols-2"><Field><Label htmlFor="event-start" required>Bắt đầu · giờ Hà Nội</Label><Input id="event-start" type="datetime-local" required value={localDateInput(event.event_date)} onChange={input => onChange({ ...event, event_date: input.target.value ? `${input.target.value}:00+07:00` : "" })} /></Field><Field><Label htmlFor="event-end" optionalLabel="không bắt buộc">Kết thúc · giờ Hà Nội</Label><Input id="event-end" type="datetime-local" min={localDateInput(event.event_date)} value={localDateInput(event.end_date)} onChange={input => onChange({ ...event, end_date: input.target.value ? `${input.target.value}:00+07:00` : null })} /></Field></Grid>
    <Grid className="items-start gap-6 md:grid-cols-2" data-poster-settings><Field><Label htmlFor="event-poster-file" required>Ảnh bìa / poster</Label><ImageDropzone id="event-poster" file={event.cover_file} existingSrc={event.cover_image_url} error={posterError} onChange={file => { setPosterError(""); onChange({ ...event, cover_file: file || undefined, cover_image_url: null }); }} /></Field><Stack gap="lg"><Field><Label htmlFor="event-additional-fee" optionalLabel="không bắt buộc">Phụ thu (VNĐ)</Label><CurrencyInput id="event-additional-fee" name="additionalFee" placeholder="Nhập mức phụ thu" value={event.additionalFee} onValueChange={additionalFee => onChange({ ...event, additionalFee })} /></Field><Stack gap="xs"><CheckboxField label="Hiển thị sự kiện trên website" checked={event.is_active} onChange={input => onChange({ ...event, is_active: input.target.checked })} /><Typography variant="small" tone="muted">Tắt để ẩn sự kiện khỏi danh sách.</Typography></Stack></Stack></Grid>
    <Field><Label htmlFor="event-content">Nội dung trang sự kiện</Label><RichTextEditor id="event-content" value={event.content_vi || ""} onChange={content => onChange({ ...event, content_vi: content })} /></Field>

  </Form>;
}
export function AdminEventDrawer({ event, isNew, onChange, onClose, onApply, onReturnFocus }: Props) {
  return <Sheet open={!!event} onOpenChange={open => { if (!open) onClose(); }}><SheetContent onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }} lang="vi" closeLabel="Đóng" aria-describedby={undefined} className={s.drawer} data-event-editor>
    <SheetHeader className="shrink-0 border-b border-[#E2E6DE] px-6 py-5 pr-16"><SheetTitle>{isNew ? "Thêm sự kiện" : "Chỉnh sửa sự kiện"}</SheetTitle></SheetHeader>
    {event ? <><EventForm key={event.id} event={event} onChange={onChange} onApply={onApply} /><Inline className="shrink-0 justify-end border-t border-[#E2E6DE] bg-white px-6 py-4"><Button variant="outline" onClick={onClose}>Hủy</Button><Button type="submit" form="event-editor" className={s.primary}><Icon name="check" />Lưu</Button></Inline></> : null}
  </SheetContent></Sheet>;
}
