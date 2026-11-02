"use client";
import {AlertMessage} from "@/components/ui/alert";
import {useEffect} from "react";
import {Controller,useForm,useWatch} from "react-hook-form";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {adminRequest,AdminRequestError} from "@/lib/admin/client";
import {adminKeys} from "@/lib/admin/query";
import {parseVideo,type VideoSettings} from "@/lib/video";
import {VideoPlayer} from "@/components/content/video-player";
import {Button} from "@/components/ui/button";
import {CheckboxField} from "@/components/ui/checkbox-field";
import {Field,Form,Input,Label} from "@/components/ui/form";
import {Grid,Inline,Stack,Surface} from "@/components/ui/layout";
import {ContentSkeleton} from "@/components/ui/loading-state";
import {Typography} from "@/components/ui/typography";
import {adminStyles as s} from "@/lib/ui/admin-styles";
import {cn} from "@/lib/utils";
export type VideoFormState={dirty:boolean;busy:boolean;valid:boolean};
type Draft={source_url:string;heading_vi:string;heading_en:string;is_visible:boolean};
type Props={onState:(state:VideoFormState)=>void;onSaved:()=>void};
function VideoForm({item,onState,onSaved,onReload}:{item:VideoSettings;onReload:()=>void}&Props){
 const t=useTranslations("AdminDesign"),client=useQueryClient();
 const form=useForm<Draft>({defaultValues:{source_url:item.source_url,heading_vi:item.heading_vi,heading_en:item.heading_en??"",is_visible:item.is_visible}}),values=useWatch({control:form.control});
 const parsed=parseVideo(values.source_url??""),valid=!!parsed&&!!values.heading_vi?.trim();
 const save=useMutation({mutationFn:(draft:Draft)=>adminRequest("/api/admin/video",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,expectedUpdatedAt:item.updated_at})}) as Promise<{item:VideoSettings}>,onSuccess:result=>{client.setQueryData(adminKeys.video,result.item);form.reset({source_url:result.item.source_url,heading_vi:result.item.heading_vi,heading_en:result.item.heading_en??"",is_visible:result.item.is_visible});onSaved();}});
 const dirty=form.formState.isDirty,busy=save.isPending;
 useEffect(()=>{onState({dirty,busy,valid});},[dirty,busy,valid,onState]);
 useEffect(()=>()=>onState({dirty:false,busy:false,valid:false}),[onState]);
 return <Form id="video-settings" noValidate aria-busy={busy} onSubmit={form.handleSubmit(draft=>save.mutate(draft))}><Grid className="items-start gap-6 xl:grid-cols-2"><Surface className={cn(s.panel,"p-5 md:p-6")}><Stack gap="lg"><Typography as="h2" variant="subheading" className="text-lg md:text-lg">{t("videoSettings")}</Typography>
 <Field><Label htmlFor="video-url" required>{t("videoUrl")}</Label><Input id="video-url" type="url" maxLength={2048} disabled={busy} aria-invalid={!!form.formState.errors.source_url||!parsed} aria-describedby="video-url-help" {...form.register("source_url",{validate:value=>!!parseVideo(value.trim())||t("invalidVideo")})} /><Typography id="video-url-help" variant="small" tone={!parsed?"danger":"muted"}>{!parsed?t("invalidVideo"):"YouTube, Facebook, Vimeo, MP4 / WebM"}</Typography></Field>
 <Grid className="items-end sm:grid-cols-2"><Field><Label htmlFor="heading-vi" required>{t("headingVi")}</Label><Input id="heading-vi" maxLength={200} disabled={busy} aria-invalid={!!form.formState.errors.heading_vi} {...form.register("heading_vi",{validate:value=>!!value.trim()||"Vui lòng nhập tiêu đề tiếng Việt.",maxLength:200})} />{form.formState.errors.heading_vi?<Typography variant="small" tone="danger" role="alert">{form.formState.errors.heading_vi.message}</Typography>:null}</Field><Field><Label htmlFor="heading-en" optionalLabel={t("optional")}>{t("headingEn")}</Label><Input id="heading-en" maxLength={200} disabled={busy} {...form.register("heading_en",{maxLength:200})} /></Field></Grid>
 <Controller control={form.control} name="is_visible" render={({field})=><CheckboxField label={t("enableVideo")} checked={field.value} disabled={busy} onChange={event=>field.onChange(event.target.checked)} />} />
 </Stack></Surface><Stack gap="md"><Inline className="justify-between"><Typography as="h2" variant="body" className="font-semibold">{t("preview")}</Typography><Typography variant="small" tone="muted">{parsed?.provider??"Video"} · 16:9</Typography></Inline><Typography as="h3" variant="subheading">{values.heading_vi}</Typography>{parsed?<VideoPlayer video={parsed} title={values.heading_vi||"Video Trixie"} />:null}{!values.is_visible?<Typography variant="small" tone="muted">{t("videoHidden")}</Typography>:null}<Typography variant="small" tone="muted">{t("frameNote")}</Typography></Stack></Grid>
 {save.isError?<Stack><AlertMessage variant="destructive">{save.error.message}</AlertMessage>{save.error instanceof AdminRequestError&&save.error.status===409?<Button variant="outline" className="w-fit" onClick={onReload}>Bỏ thay đổi và tải cấu hình mới</Button>:null}</Stack>:null}
 </Form>;
}
export function AdminVideo(props:Props){
 const query=useQuery<VideoSettings>({queryKey:adminKeys.video,queryFn:async({signal})=>(await adminRequest("/api/admin/video",{signal})).item});
 if(query.isPending)return <ContentSkeleton image label="Đang tải cấu hình video…" />;
 if(query.isError)return <Stack><AlertMessage variant="destructive">{query.error.message}</AlertMessage><Button variant="outline" className="w-fit" onClick={()=>void query.refetch()}>Thử lại</Button></Stack>;
 return <VideoForm key={query.data.updated_at} item={query.data} {...props} onReload={()=>void query.refetch()} />;
}
