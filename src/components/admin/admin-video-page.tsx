"use client";
import {useState} from "react";
import {AdminVideo,type VideoFormState} from "@/components/admin/admin-video";
import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
import {Inline,Stack} from "@/components/ui/layout";
import {Typography} from "@/components/ui/typography";
import {AlertMessage} from "@/components/ui/alert";
import {useToast} from "@/components/ui/toast";
import {adminStyles as s} from "@/lib/ui/admin-styles";
export function AdminVideoPage(){const [state,setState]=useState<VideoFormState>({dirty:false,busy:false,valid:false});const toast=useToast();return <Stack gap="lg" data-admin-page="video"><Inline className="items-start justify-between"><Typography as="h1" variant="heading" className="text-2xl md:text-2xl">Video trang chủ</Typography><Button className={s.primary} type="submit" form="video-settings" disabled={!state.dirty||!state.valid||state.busy}><Icon name="check" />{state.busy?"Đang lưu…":"Lưu"}</Button></Inline>{state.dirty?<AlertMessage variant="warning">Có thay đổi chưa lưu</AlertMessage>:null}<AdminVideo onState={setState} onSaved={()=>toast("Đã lưu video.")} /></Stack>}
