"use client";
import {useRouter} from "next/navigation";
import {useCreationExit} from "@/lib/admin/use-creation-exit";
import {CreationCloseDialog} from "@/components/admin/creation-close-dialog";
import {useQuery} from "@tanstack/react-query";
import {adminKeys} from "@/lib/admin/query";
import {TicketColourField} from "@/components/admin/ticket-colour-field";
import {EventTicket} from "@/components/lounge/home-ticket-shows";
import {adminRequest,uploadAdminImage} from "@/lib/admin/client";
import {ContentSkeleton} from "@/components/ui/loading-state";
import {AlertMessage} from "@/components/ui/alert";

import { useState,useRef,useImperativeHandle,type Ref } from "react";
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

type EventFormHandle={mediaSession:()=>string;saveDraft:()=>Promise<void>;discard:()=>Promise<void>};
type Props = { onDraftSaved:()=>void|Promise<void>; onDelete?: (event:EditableEvent)=>void; saving?: boolean; error?: string; event: EditableEvent | null; isNew: boolean; onClose: () => void; onApply: (event: EditableEvent) => void | Promise<void>; onReturnFocus: () => void };
function FormError({message,id}:{message?:string;id:string}) {
 return message?<Typography id={id} role="alert" variant="small" tone="danger">{message}</Typography>:null;
}
function EventForm({event,onApply,uploading,saving,onUploadStateChange,actions}:{actions:Ref<EventFormHandle>;saving:boolean;uploading:boolean;onUploadStateChange:(busy:boolean)=>void;event:EditableEvent;onApply:Props["onApply"]}) {
 const [english,setEnglish]=useState(false);
 const [mediaSession]=useState(()=>crypto.randomUUID());
 const [coverBusy,setCoverBusy]=useState(false);
 const {control,handleSubmit,getValues,setValue,setError,clearErrors,formState:{errors}}=useForm<EditableEvent>({defaultValues:{...event,title_en:event.title_en??"",content_vi:event.content_vi??"",additionalFee:event.additionalFee??0},mode:"onSubmit"});
 const [start,coverFile,coverUrl,artist,paletteKey,override]=useWatch({control,name:["event_date","cover_file","cover_image_url","performer_name","ticket_palette_key","ticket_palette_override"]});
 useImperativeHandle(actions,()=>({
  mediaSession:()=>mediaSession,
  saveDraft:async()=>{const values=getValues();await adminRequest("/api/admin/drafts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"event",id:event.is_draft?event.id:null,expectedUpdatedAt:event.updated_at,media_session:mediaSession,data:values})});},
  discard:async()=>{await adminRequest("/api/admin/drafts",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({media_session:mediaSession})});}
 }));
 async function selectCover(file:File|null) {
  if(uploading||saving||coverBusy)return;
  clearErrors("cover_image_url");
  if(!file){setValue("cover_file",undefined,{shouldDirty:true});setValue("cover_image_url",null,{shouldDirty:true});setValue("cover_asset_id",null,{shouldDirty:true});setValue("ticket_palette_key",null,{shouldDirty:true});setValue("ticket_palette_override",null,{shouldDirty:true});return;}
  const previous={url:getValues("cover_image_url"),id:getValues("cover_asset_id"),palette:getValues("ticket_palette_key")};
  setCoverBusy(true);onUploadStateChange(true);setValue("cover_file",file);setValue("cover_image_url",null);
  try {
   const image=await uploadAdminImage(file,"event",mediaSession);
   setValue("cover_image_url",image.url,{shouldDirty:true});setValue("cover_asset_id",image.asset.id,{shouldDirty:true});
   setValue("ticket_palette_key",image.asset.ticket_palette_key??null,{shouldDirty:true});setValue("ticket_palette_override",null,{shouldDirty:true});
  } catch(error){setValue("cover_image_url",previous.url);setValue("cover_asset_id",previous.id);setValue("ticket_palette_key",previous.palette);setError("cover_image_url",{message:error instanceof Error?error.message:"Không thể tải ảnh. Vui lòng thử lại."});}
  finally{setValue("cover_file",undefined);setCoverBusy(false);onUploadStateChange(false);}
 }

 return <Form noValidate inert={saving||coverBusy} aria-busy={saving} id="event-editor" className="min-h-0 flex-1 overflow-y-auto p-6" onSubmit={handleSubmit(async values=>{
  if(uploading||saving)return;
  if(!values.cover_file&&!values.cover_image_url){setError("cover_image_url",{message:"Vui lòng chọn ảnh chương trình trước khi lưu."});document.getElementById("event-poster")?.focus();return;}
  await onApply({...event,...values,media_session:mediaSession});
 })}>
  <Grid className="gap-4 sm:grid-cols-2">
   <Field><Label htmlFor="event-name" required>Tên chương trình</Label><Controller control={control} name="title_vi" rules={{validate:value=>!!value.trim()&&value.length<=200||"Nhập tên chương trình từ 1 đến 200 ký tự."}} render={({field})=><Input {...field} id="event-name" maxLength={200} aria-invalid={!!errors.title_vi} aria-describedby={errors.title_vi?"event-name-error":undefined} />} /><FormError id="event-name-error" message={errors.title_vi?.message} /></Field>
   <Field><Label htmlFor="artist" required>Nghệ sĩ</Label><Controller control={control} name="performer_name" rules={{validate:value=>!!value.trim()&&value.length<=160||"Vui lòng nhập tên nghệ sĩ."}} render={({field})=><Input {...field} id="artist" maxLength={160} aria-invalid={!!errors.performer_name} />} /><FormError id="artist-error" message={errors.performer_name?.message} /></Field>
  </Grid>
  <Stack gap="sm"><Inline gap="xs"><Button variant="ghost" size="sm" className="h-auto w-fit justify-start p-0 font-normal text-blue-700 underline underline-offset-4 hover:bg-transparent hover:text-blue-800" aria-expanded={english} aria-controls="event-name-en-field" onClick={()=>{setEnglish(!english);if(!english)requestAnimationFrame(()=>document.getElementById("event-name-en")?.focus());}}>{english?"Ẩn tên Tiếng Anh":"Thêm tên Tiếng Anh"}</Button><TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="size-7 rounded-full text-stone-500" aria-label="Tên Tiếng Anh được dùng khi nào?"><Icon name="help" className="size-4" /></Button></TooltipTrigger><TooltipContent className="max-w-72">Tên này được dùng khi khách xem website bằng tiếng Anh.</TooltipContent></Tooltip></TooltipProvider></Inline>{english?<Field id="event-name-en-field"><Label htmlFor="event-name-en" optionalLabel="không bắt buộc">Tên chương trình tiếng Anh</Label><Controller control={control} name="title_en" render={({field})=><Input {...field} value={field.value??""} id="event-name-en" maxLength={200} />} /></Field>:null}</Stack>
  <Grid className="items-start gap-6 md:grid-cols-2" data-poster-settings>
   <Field><Label htmlFor="event-poster-file" required>Ảnh bìa / poster</Label><ImageDropzone id="event-poster" file={coverFile} existingSrc={coverUrl??null} error={errors.cover_image_url?.message} preview={<EventTicket preview locale="vi" event={{id:event.id,title:"",performerName:artist||"Tên nghệ sĩ",eventDate:start||"",coverImageUrl:coverUrl??null,ticketPaletteKey:override??paletteKey,fallbackFromVietnamese:false}} />} onChange={file=>void selectCover(file)} /></Field>
   <Stack gap="md">  <Grid className="gap-4">
   <Field><Label htmlFor="event-start" required>Bắt đầu · giờ Hà Nội</Label><Controller control={control} name="event_date" rules={{validate:value=>Number.isFinite(Date.parse(value))||"Vui lòng chọn ngày và giờ bắt đầu."}} render={({field})=><DateTimeInput ref={field.ref} onBlur={field.onBlur} id="event-start" value={localDateInput(field.value)} onValueChange={value=>field.onChange(value?value+":00+07:00":"")} aria-invalid={!!errors.event_date} />} /><FormError id="event-start-error" message={errors.event_date?.message} /></Field>
   <Field><Label htmlFor="event-end" optionalLabel="không bắt buộc">Kết thúc · giờ Hà Nội</Label><Controller control={control} name="end_date" rules={{validate:value=>!value||Date.parse(value)>=Date.parse(getValues("event_date"))||"Giờ kết thúc phải sau giờ bắt đầu."}} render={({field})=><DateTimeInput ref={field.ref} onBlur={field.onBlur} id="event-end" min={localDateInput(start)} value={localDateInput(field.value)} onValueChange={value=>field.onChange(value?value+":00+07:00":null)} aria-invalid={!!errors.end_date} />} /><FormError id="event-end-error" message={errors.end_date?.message} /></Field>
  </Grid>
<TicketColourField detected={paletteKey} override={override} disabled={!coverUrl||coverBusy||!getValues("cover_asset_id")} onChange={value=>setValue("ticket_palette_override",value,{shouldDirty:true})} /><Field><Label htmlFor="event-additional-fee" optionalLabel="không bắt buộc">Phụ thu (VNĐ)</Label><Controller control={control} name="additionalFee" render={({field})=><CurrencyInput id="event-additional-fee" name={field.name} placeholder="Nhập mức phụ thu" value={field.value} onValueChange={field.onChange} />} /></Field><Stack gap="xs"><Controller control={control} name="is_active" render={({field})=><CheckboxField label="Hiển thị sự kiện trên website" checked={field.value} onChange={input=>field.onChange(input.target.checked)} />} /><Typography variant="small" tone="muted">Tắt để ẩn sự kiện khỏi danh sách.</Typography></Stack></Stack>
  </Grid>
  <Field><Label htmlFor="event-content">Nội dung trang sự kiện</Label><Controller control={control} name="content_vi" render={({field})=><RichTextEditor mediaSession={mediaSession} onUploadStateChange={onUploadStateChange} id="event-content" value={field.value??""} onChange={field.onChange} />} /></Field>
 </Form>;
}
export function AdminEventDrawer({ onDraftSaved,event, isNew, onClose, onApply, onReturnFocus, saving = false, error = "", onDelete }: Props) {
  const [uploading,setUploading] = useState(false);
  const [closePrompt,setClosePrompt]=useState(false),[actionBusy,setActionBusy]=useState(false),[actionError,setActionError]=useState("");
  const actions=useRef<EventFormHandle>(null),destination=useRef<string|null>(null);const router=useRouter();
  function finish(){setClosePrompt(false);onClose();if(destination.current){router.push(destination.current);destination.current=null;}}
  async function discard(){if(saving||uploading||actionBusy)return;setActionBusy(true);setActionError("");try{await actions.current?.discard();finish();}catch(cause){setActionError((cause as Error).message);setClosePrompt(true);}finally{setActionBusy(false);}}
  function requestClose(href?:string){if(saving||uploading||actionBusy)return;destination.current=href??null;if(isNew){setActionError("");setClosePrompt(true);}else void discard();}
  async function saveDraft(){if(saving||uploading||actionBusy)return;setActionBusy(true);setActionError("");try{await actions.current?.saveDraft();await onDraftSaved();finish();}catch(cause){setActionError((cause as Error).message);setClosePrompt(true);}finally{setActionBusy(false);}}
  useCreationExit(!!event&&isNew,href=>requestClose(href));
  const detail=useQuery<EditableEvent>({queryKey:[...adminKeys.events,"detail",event?.id,event?.updated_at],enabled:!!event&&!isNew,staleTime:0,queryFn:async({signal})=>{const {item}=await adminRequest("/api/admin/events/"+event!.id,{signal});return {...item,additionalFee:item.additional_fee??0};}});
  const readyEvent=isNew?event:detail.data;

  return <><CreationCloseDialog open={closePrompt} busy={actionBusy||saving||uploading} error={actionError} onKeepEditing={()=>{setClosePrompt(false);destination.current=null;}} onSaveDraft={()=>void saveDraft()} onDiscard={()=>void discard()} /><Sheet open={!!event} onOpenChange={open => { if (!open) requestClose(); }}><SheetContent onCloseAutoFocus={event => { event.preventDefault(); onReturnFocus(); }} lang="vi" closeLabel="Đóng" aria-describedby={undefined} className={s.drawer} data-event-editor>
    <SheetHeader className="shrink-0 border-b border-[#E2E6DE] px-6 py-5 pr-16"><SheetTitle>{isNew ? "Thêm sự kiện" : "Chỉnh sửa sự kiện"}</SheetTitle></SheetHeader>
    {error ? <AlertMessage variant="destructive">{error}</AlertMessage> : null}
    {event&&!isNew&&detail.isPending?<ContentSkeleton label="Đang tải nội dung sự kiện…" />:null}
    {event&&!isNew&&detail.isError?<Stack className="p-6"><AlertMessage variant="destructive">{detail.error.message}</AlertMessage><Button variant="outline" onClick={()=>void detail.refetch()}>Thử lại</Button></Stack>:null}
    {readyEvent ? <><EventForm actions={actions} saving={saving||actionBusy} uploading={uploading} onUploadStateChange={setUploading} key={readyEvent.id} event={readyEvent} onApply={onApply} /><Inline className="shrink-0 justify-end border-t border-[#E2E6DE] bg-white px-6 py-4">{!isNew && onDelete ? <Button variant="destructive" disabled={saving || uploading || actionBusy} className="mr-auto" onClick={()=>onDelete({...readyEvent,media_session:actions.current?.mediaSession()})}><Icon name="trash" />Xóa sự kiện</Button> : null}<Button disabled={saving || uploading || actionBusy} variant="outline" onClick={()=>requestClose()}>Hủy</Button>{isNew||event?.is_draft?<Button variant="outline" disabled={saving||uploading||actionBusy} onClick={()=>void saveDraft()}>Lưu bản nháp</Button>:null}<Button disabled={saving || uploading || actionBusy} type="submit" form="event-editor" className={s.primary}><Icon name="check" />{saving ? "Đang lưu…" : uploading ? "Đang tải ảnh…" : "Lưu"}</Button></Inline></> : null}
  </SheetContent></Sheet></>;
}
