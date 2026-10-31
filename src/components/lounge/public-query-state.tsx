"use client";
import {Button} from "@/components/ui/button";
import {Stack} from "@/components/ui/layout";
import {Typography} from "@/components/ui/typography";
export function PublicQueryState({error,english,retry}:{error:boolean;english:boolean;retry:()=>void}){
 return <Stack gap="sm"><Typography role={error?"alert":"status"}>{english?(error?"Unable to load the schedule. Please try again.":"Loading schedule…"):(error?"Không tải được lịch diễn. Vui lòng thử lại.":"Đang tải lịch diễn…")}</Typography>{error?<Button variant="outline" className="w-fit" onClick={retry}>{english?"Try again":"Thử lại"}</Button>:null}</Stack>;
}
