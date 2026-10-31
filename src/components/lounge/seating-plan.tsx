"use client";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Carousel,CarouselItem} from "@/components/ui/carousel";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {eventStyles as s} from "@/lib/ui/event-styles";
import {Inline,Stack,Surface} from "@/components/ui/layout";
import {Media} from "@/components/ui/media";
import {Icon} from "@/components/ui/icon";
import {Typography} from "@/components/ui/typography";
export type SeatingImage={src:string;label:string;width:number;height:number};
export function SeatingPlan({images,english=false}:{images:SeatingImage[];english?:boolean}) {
 const [selected,setSelected]=useState<number|null>(null);
 if(!images.length)return null;
 const image=selected===null?null:images[selected];
 return <Stack gap="lg" className="border-t border-stone-200 pt-8" data-seating-plan>
  <Carousel label={english?"Seating plan":"Sơ đồ chỗ ngồi"} columns={1} autoplay pauseOnHover={false} paused={selected!==null} heading={<Typography as="h2" variant="heading">{english?"Seating plan":"Sơ đồ chỗ ngồi"}</Typography>}>
   {images.map((item,index)=><CarouselItem key={item.src}><Stack gap="sm"><Typography as="h3" variant="subheading">{item.label}</Typography><Button variant="ghost" className="group relative h-auto w-full overflow-hidden p-0" aria-label={(english?"Enlarge: ":"Xem lớn: ")+item.label} onClick={()=>setSelected(index)}><Media src={item.src} alt={item.label} width={item.width} height={item.height} fit="contain" sizes="(min-width:1024px) 960px, 100vw" className="h-auto w-full rounded-md" /><Surface aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"><Surface className="flex size-14 items-center justify-center rounded-full bg-white/95 text-[#15201C] shadow-md"><Icon name="eye" className="size-6" /></Surface></Surface></Button></Stack></CarouselItem>)}
  </Carousel>
  <Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className={s.viewer} closeLabel={english?"Close":"Đóng"}><DialogTitle className="pr-10">{image?.label}</DialogTitle><DialogDescription className="sr-only">{english?"Full seating map":"Sơ đồ chỗ ngồi phóng lớn"}</DialogDescription>
   <Surface className="relative min-h-0 w-full">{image ? <Media src={image.src} alt={image.label} fill fit="contain" sizes="(min-width:1024px) 1200px, 100vw" />:null}</Surface>
   <Inline className="justify-center" aria-label={english?"Choose floor":"Chọn tầng"}>{images.map((floor,index)=><Button key={floor.src} variant={selected===index?"primary":"outline"} aria-pressed={selected===index} onClick={()=>setSelected(index)}>{floor.label}</Button>)}</Inline>
  </DialogContent></Dialog>
 </Stack>;
}
