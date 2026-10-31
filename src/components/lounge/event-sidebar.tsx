"use client";
import {useQuery} from "@tanstack/react-query";
import {publicEventsOptions} from "@/lib/public/query";
import {bookableEvents} from "@/lib/server/content-policy";
import {localizeEvent} from "@/lib/menu/map-menu";
import {formatDate} from "@/lib/dates";
import {useState} from "react";
import {Carousel,CarouselItem} from "@/components/ui/carousel";
import {Icon} from "@/components/ui/icon";
import {Inline,Stack,Surface} from "@/components/ui/layout";
import {AppLink} from "@/components/ui/link";
import {Media} from "@/components/ui/media";
import {Typography} from "@/components/ui/typography";
import {eventStyles as s} from "@/lib/ui/event-styles";
import type {AppLocale} from "@/i18n/config";
export function EventSidebar({currentId,locale}:{currentId:string;locale:AppLocale}) {
 const query=useQuery(publicEventsOptions());
 const events=bookableEvents(query.data??[]).filter(row=>(row.public_id||row.id)!==currentId).slice(0,12).map(row=>localizeEvent(locale,row));
 const [hovered,setHovered]=useState(false);
 if(!events.length)return null;
 const language=locale==="vi"?"vi-VN":"en-GB";
 const timeFormat=new Intl.DateTimeFormat(language,{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Ho_Chi_Minh"});
 return <Surface className={s.sidebar} data-event-sidebar onPointerEnter={event=>{if(event.pointerType==="mouse")setHovered(true);}} onPointerMove={event=>{if(event.pointerType==="mouse")setHovered(true);}} onPointerLeave={()=>setHovered(false)}>
  <Carousel label={locale==="vi"?"Sự kiện khác":"Other events"} orientation="vertical" visibleSlides={4} autoScroll paused={hovered} headerClassName={s.relatedBanner} compactControls showCounter={false}
   heading={<Typography as="h2" variant="subheading" className={s.relatedHeading}>{locale==="vi"?"Sự kiện khác":"Other events"}</Typography>}>
   {events.map(event=><CarouselItem key={event.id}><AppLink href={"/events/"+event.id} className={s.card} data-related-event>
    <Surface className={s.thumbnail}>{event.coverImageUrl ? <Media src={event.coverImageUrl} alt="" fill fit="contain" sizes="76px" /> : <Icon name="music" className="m-auto size-6" />}</Surface>
    <Stack gap="sm"><Typography as="h3" variant="small" className={s.title}>{event.title}</Typography>
     <Inline gap="xs" className={s.metadata}><Inline gap="xs"><Icon name="calendar" className="size-3.5" /><Typography as="time" dateTime={event.eventDate} variant="caption">{formatDate(event.eventDate)}</Typography></Inline><Inline gap="xs"><Icon name="clock" className="size-3.5" /><Typography as="span" variant="caption">{timeFormat.format(new Date(event.eventDate))}</Typography></Inline></Inline>
    </Stack>
   </AppLink></CarouselItem>)}
  </Carousel>
 </Surface>;
}
