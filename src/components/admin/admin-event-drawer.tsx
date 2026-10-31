"use client";

import { useState } from "react";
import {Controller,useForm,useWatch} from "react-hook-form";
import {DateTimeInput} from "@/components/ui/date-input";
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

type Props = { onDelete?: (event:EditableEvent)=>void; saving?: boolean; error?: string; event: EditableEvent | null; isNew: boolean; onClose: () => void; onApply: (event: EditableEvent) => void | Promise<void>; onReturnFocus: () => void };
function FormError({message,id}:{message?:string;id:string}) {
 return message?<Typography id={id} role="alert" variant="small" tone="danger">{message}</Typography>:null;
}
function EventForm({event,onApply,uploading,saving,onUploadStateChange}:{saving:boolean;uploading:boolean;onUploadStateChange:(busy:boolean)=>void;event:EditableEvent;onApply:Props["onApply"]}) {
 const [english,setEnglish]=useState(false);
 const {control,handleSubmit,getValues,setValue,setError,clearErrors,formState:{errors}}=useForm<EditableEvent>({defaultValues:{...event,title_en:event.title_en??"",content_vi:event.content_vi??"",additionalFee:event.additionalFee??null},mode:"onSubmit"});
 const [start,coverFile,coverUrl]=useWatch({control,name:["event_date","cover_file","cover_image_url"]});
 return <Form noValidate inert={saving} aria-busy={saving} id="event-editor" className="min-h-0 flex-1 overflow-y-auto p-6" onSubmit={handleSubmit(async values=>{
  if(uploading||saving)return;
  if(!values.cover_file&&!values.cover_image_url){setError("cover_image_url",{message:"Vui lòng chọn ảnh chương trình trước khi lưu."});document.getElementById("event-poster")?.focus();return;}
  await onApply({...event,...values});
 })}>
  <Grid className="gap-4 sm:grid-cols-2">
   <Field><Label htmlFor="event-name" required>Tên chương trình</Label><Controller control={control} name="title_vi" rules={{validate:value=>!!value.trim()&&value.length<=200||"Nhập tên chương trình từ 1 đến 200 ký tự."}} render={({field})=><Input {...field} id="event-name" maxLength={200} aria-invalid={!!errors.title_vi} aria-describedby={errors.title_vi?"event-name-error":undefined} />} /><FormError id="event-name-error" message={errors.title_vi?.message} /></Field>
   <Field><Label htmlFor="artist" required>Nghệ sĩ</Label><Controller control={control} name="performer_name" rules={{validate:value=>!!value.trim()&&value.length<=160||"Vui lòng nhập tên nghệ sĩ."}} render={({field})=><Input {...field} id="artist" maxLength={160} aria-invalid={!!errors.performer_name} />} /><FormError id="artist-error" message={errors.performer_name?.message} /></Field>
  </Grid>
  <Stack gap="sm"><Inline gap="xs"><Button variant="ghost" size="sm" className="h-auto w-fit justify-start p-0 font-normal text-blue-700 underline underline-offset-4 hover:bg-transparent hover:text-blue-800" aria-expanded={english} aria-controls="event-name-en-field" onClick={()=>{setEnglish(!english);if(!english)requestAnimationFrame(()=>document.getElementById("event-name-en")?.focus());}}>{english?"Ẩn tên Tiếng Anh":"Thêm tên Tiếng Anh"}</Button><TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 rounded-full text-stone-500" aria-label="Tên Tiếng Anh được dùng khi nào?"><Icon name="help" className="size-4" /></Button></TooltipTrigger><TooltipContent className="max-w-72">Tên này được dùng khi khách xem website bằng tiếng Anh.</TooltipContent></Tooltip></TooltipProvider></Inline>{english?<Field id="event-name-en-field"><Label htmlFor="event-name-en" optionalLabel="không bắt buộc">Tên chương trình tiếng Anh</Label><Controller control={control} name="title_en" render={({field})=><Input {...field} value={field.value??""} id="event-name-en" maxLength={200} />} /></Field>:null}</Stack>
  <Grid className="gap-4 sm:grid-cols-2">
   <Field><Label htmlFor="event-start" required>Bắt đầu · giờ Hà Nội</Label><Controller control={control} name="event_date" rules={{validate:value=>Number.isFinite(Date.parse(value))||"Vui lòng chọn ngày và giờ bắt đầu."}} render={({field})=><DateTimeInput ref={field.ref} onBlur={field.onBlur} id="event-start" value={localDateInput(field.value)} onValueChange={value=>field.onChange(value?value+":00+07:00":"")} aria-invalid={!!errors.event_date} />} /><FormError id="event-start-error" message={errors.event_date?.message} /></Field>
   <Field><Label htmlFor="event-end" optionalLabel="không bắt buộc">Kết thúc · giờ Hà Nội</Label><Controller control={control} name="end_date" rules={{validate:value=>!value||Date.parse(value)>=Date.parse(getValues("event_date"))||"Giờ kết thúc phải sau giờ bắt đầu."}} render={({field})=><DateTimeInput ref={field.ref} onBlur={field.onBlur} id="event-end" min={localDateInput(start)} value={localDateInput(field.value)} onValueChange={value=>field.onChange(value?value+":00+07:00":null)} aria-invalid={!!errors.end_date} />} /><FormError id="event-end-error" message={errors.end_date?.message} /></Field>
  </Grid>
  <Grid className="items-start gap-6 md:grid-cols-2" data-poster-settings>
   <Field><Label htmlFor="event-poster-file" required>Ảnh bìa / poster</Label><ImageDropzone id="event-poster" file={coverFile} existingSrc={coverUrl??null} error={errors.cover_image_url?.message} onChange={file=>{clearErrors("cover_image_url");setValue("cover_file",file??undefined,{shouldDirty:true});setValue("cover_image_url",null,{shouldDirty:true});}} /></Field>
   <Stack gap="lg"><Field><Label htmlFor="event-additional-fee" optionalLabel="không bắt buộc">Phụ thu (VNĐ)</Label><Controller control={control} name="additionalFee" render={({field})=><CurrencyInput id="event-additional-fee" name={field.name} placeholder="Nhập mức phụ thu" value={field.value} onValueChange={field.onChange} />} /></Field><Stack gap="xs"><Controller control={control} name="is_active" render={({field})=><CheckboxField label="Hiển thị sự kiện trên website" checked={field.value} onChange={input=>field.onChange(input.target.checked)} />} /><Typography variant="small" tone="muted">Tắt để ẩn sự kiện khỏi danh sách.</Typography></Stack></Stack>
  </Grid>
  <Field><Label htmlFor="event-content">Nội dung trang sự kiện</Label><Controller control={control} name="content_vi" render={({field})=><RichTextEditor onUploadStateChange={onUploadStateChange} id="event-content" value={field.value??""} onChange={field.onChange} />} /></Field>
 </Form>;
}
export function AdminEventDrawer({ event, isNew, onClose, onApply, onReturnFocus, saving = false, error = "", onDelete }: Props) {
  const [uploading,setUploading] = useState(false);
  return <Sheet open={!!event} onOpenChange={open => { if (!open && !saving && !uploading) onClose(); }}><SheetContent onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }} lang="vi" closeLabel="Đóng" aria-describedby={undefined} className={s.drawer} data-event-editor>
    <SheetHeader className="shrink-0 border-b border-[#E2E6DE] px-6 py-5 pr-16"><SheetTitle>{isNew ? "Thêm sự kiện" : "Chỉnh sửa sự kiện"}</SheetTitle></SheetHeader>
    {error ? <Typography role="alert" tone="danger" className="px-6 pt-4">{error}</Typography> : null}
    {event ? <><EventForm saving={saving} uploading={uploading} onUploadStateChange={setUploading} key={event.id} event={event} onApply={onApply} /><Inline className="shrink-0 justify-end border-t border-[#E2E6DE] bg-white px-6 py-4">{!isNew && onDelete ? <Button variant="ghost" disabled={saving || uploading} className="mr-auto text-red-700 hover:bg-red-50" onClick={()=>onDelete(event)}><Icon name="trash" />Xóa sự kiện</Button> : null}<Button disabled={saving || uploading} variant="outline" onClick={onClose}>Hủy</Button><Button disabled={saving || uploading} type="submit" form="event-editor" className={s.primary}><Icon name="check" />{saving ? "Đang lưu…" : uploading ? "Đang tải ảnh…" : "Lưu"}</Button></Inline></> : null}
  </SheetContent></Sheet>;
}
