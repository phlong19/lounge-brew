"use client";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/admin/query";
import { adminRequest, uploadAdminImage } from "@/lib/admin/client";
import { seatingImageUrl, type SeatingSettings } from "@/lib/seating";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Form } from "@/components/ui/form";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Grid, Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";

type SeatingDraft = {lower_asset_id:string|null;upper_asset_id:string|null;is_visible:boolean;lowerFile:File|null;upperFile:File|null};
function SeatingForm({item,onSaved}:{item:SeatingSettings;onSaved:()=>void}) {
 const client=useQueryClient();
 const {control,handleSubmit,setValue,reset,formState:{isDirty}}=useForm<SeatingDraft>({defaultValues:{lower_asset_id:item.lower_asset_id,upper_asset_id:item.upper_asset_id,is_visible:item.is_visible,lowerFile:null,upperFile:null}});
 const values=useWatch({control});
 const save=useMutation({mutationFn:async (draft:SeatingDraft)=>{
  const lower=draft.lowerFile?(await uploadAdminImage(draft.lowerFile)).asset.id:draft.lower_asset_id;
  const upper=draft.upperFile?(await uploadAdminImage(draft.upperFile)).asset.id:draft.upper_asset_id;
  const result=await adminRequest("/api/admin/seating",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({lower_asset_id:lower,upper_asset_id:upper,is_visible:draft.is_visible,expectedUpdatedAt:item.updated_at})});
  return result.item as SeatingSettings;
 },onSuccess:async saved=>{
  reset({lower_asset_id:saved.lower_asset_id,upper_asset_id:saved.upper_asset_id,is_visible:saved.is_visible,lowerFile:null,upperFile:null});
  client.setQueryData(adminKeys.seating,saved);onSaved();
  await client.invalidateQueries({queryKey:adminKeys.seating});
 }});
 return <Form noValidate inert={save.isPending} aria-busy={save.isPending} onSubmit={handleSubmit(draft=>save.mutate(draft))}>
  {save.error?<Typography role="alert" tone="danger">{save.error.message}</Typography>:null}
  <Grid className="md:grid-cols-2">{(["lower","upper"] as const).map((key,index)=><Stack key={key}>
   <Typography as="h2" variant="subheading">Tầng {index+1}</Typography>
   <ImageDropzone id={"seating-"+key} file={values[key+"File" as "lowerFile"|"upperFile"]??undefined} existingSrc={values[key+"_asset_id" as "lower_asset_id"|"upper_asset_id"]?seatingImageUrl(item[key]):null} onChange={file=>{setValue(key+"File" as "lowerFile"|"upperFile",file,{shouldDirty:true});setValue(key+"_asset_id" as "lower_asset_id"|"upper_asset_id",null,{shouldDirty:true});}} />
  </Stack>)}</Grid>
  <Controller control={control} name="is_visible" render={({field})=><CheckboxField label="Hiển thị sơ đồ trên trang sự kiện" checked={field.value} disabled={save.isPending} onChange={event=>field.onChange(event.target.checked)} />} />
  <Button type="submit" className="w-fit" disabled={save.isPending||!isDirty}>{save.isPending?"Đang lưu…":"Lưu sơ đồ"}</Button>
 </Form>;
}
export function AdminSeating() {
 const [notice,setNotice]=useState("");
 const query=useQuery({queryKey:adminKeys.seating,queryFn:async ({signal})=>{const data=await adminRequest("/api/admin/seating",{signal});return data.item as SeatingSettings;}});
 return <Stack gap="lg">
  <Typography tone="muted">Sơ đồ dùng chung cho tất cả sự kiện. Thay đổi tại đây sẽ cập nhật trên mọi trang sự kiện.</Typography>
  {notice?<Typography role="status">{notice}</Typography>:null}
  {query.isPending?<Typography role="status">Đang tải sơ đồ…</Typography>:query.error?<Stack><Typography role="alert" tone="danger">{query.error.message}</Typography><Button variant="outline" className="w-fit" onClick={()=>void query.refetch()}>Tải lại cấu hình</Button></Stack>:<SeatingForm key={query.data.updated_at} item={query.data} onSaved={()=>setNotice("Đã lưu sơ đồ cho tất cả trang sự kiện.")} />}
 </Stack>;
}
