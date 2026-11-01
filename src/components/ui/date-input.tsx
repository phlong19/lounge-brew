"use client";
import {useRef,useState,type ComponentPropsWithRef} from "react";
import {useLocale} from "next-intl";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/form";
import {Icon} from "@/components/ui/icon";
import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover";
import {Typography} from "@/components/ui/typography";
import {monthDays} from "@/lib/events/calendar";
import {formatDate,isCalendarDate,maskDate,parseDisplayDate} from "@/lib/dates";
import {cn} from "@/lib/utils";

type Props=Omit<ComponentPropsWithRef<"input">,"value"|"onChange"|"type"|"min"|"max">&{value:string;onValueChange:(value:string)=>void;min?:string;max?:string};
export function DateInput({value,onValueChange,min,max,className,disabled,ref,onBlur,...props}:Props){
 const english=useLocale()==="en";
 const [draft,setDraft]=useState({source:value,text:formatDate(value)});
 const [open,setOpen]=useState(false);
 const seed=isCalendarDate(value)?value:isCalendarDate(min??"")?min!:parseDisplayDate(formatDate(new Date().toISOString()));
 const [month,setMonth]=useState(()=>seed.slice(0,7));
 const calendar=useRef<HTMLDivElement>(null);
 const [year,index]=month.split("-").map(Number);
 const title=new Intl.DateTimeFormat(english?"en-GB":"vi-VN",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(month+"-01T12:00:00Z"));
 function move(delta:number){setMonth(new Date(Date.UTC(year,index-1+delta,1)).toISOString().slice(0,7));}
 function choose(iso:string){setDraft({source:iso,text:formatDate(iso)});onValueChange(iso);setOpen(false);}
 return <div className="relative min-w-0">
  <Input {...props} ref={ref} type="text" inputMode="numeric" autoComplete="off" placeholder="dd/mm/yyyy" maxLength={10} disabled={disabled} value={draft.source===value?draft.text:formatDate(value)} onBlur={onBlur} onChange={event=>{const text=maskDate(event.target.value),iso=parseDisplayDate(text);setDraft({source:iso,text});onValueChange(iso);}} className={cn("pr-11 tabular-nums",className)} />
  <Popover open={open} onOpenChange={next=>{if(next)setMonth(seed.slice(0,7));setOpen(next);}}>
   <PopoverTrigger asChild><Button disabled={disabled} variant="ghost" size="icon" aria-label={english?"Choose date":"Chọn ngày"} className="absolute top-1/2 right-1 size-9 min-h-9 -translate-y-1/2"><Icon name="calendar" className="size-4" /></Button></PopoverTrigger>
   <PopoverContent align="start" className="w-80 p-3" onOpenAutoFocus={event=>{event.preventDefault();(calendar.current?.querySelector<HTMLButtonElement>(`[data-day="${value}"]:not(:disabled)`)??calendar.current?.querySelector<HTMLButtonElement>("button:not(:disabled)"))?.focus();}}>
    <div className="mb-2 flex items-center justify-between"><Button variant="ghost" size="icon" className="size-8 min-h-8" aria-label={english?"Previous month":"Tháng trước"} onClick={()=>move(-1)}><Icon name="chevronLeft" className="size-4" /></Button><Typography variant="small" className="capitalize" aria-live="polite">{title}</Typography><Button variant="ghost" size="icon" className="size-8 min-h-8" aria-label={english?"Next month":"Tháng sau"} onClick={()=>move(1)}><Icon name="chevronRight" className="size-4" /></Button></div>
    <div ref={calendar} className="grid grid-cols-7 gap-1" aria-label={title}>
     {(english?["Mo","Tu","We","Th","Fr","Sa","Su"]:["T2","T3","T4","T5","T6","T7","CN"]).map(day=><Typography key={day} variant="caption" className="py-1 text-center text-stone-500">{day}</Typography>)}
     {monthDays(year,index-1).map(day=><Button key={day.key} data-day={day.key} disabled={!!(min&&day.key<min||max&&day.key>max)} aria-label={formatDate(day.key)} aria-pressed={day.key===value} variant={day.key===value?"primary":"ghost"} size="icon" className={cn("size-9 min-h-9 w-full text-sm",day.month!==index-1&&"text-stone-400")} onClick={()=>choose(day.key)} onKeyDown={event=>{
      const delta=({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7} as Record<string,number>)[event.key];if(!delta)return;
      event.preventDefault();const next=new Date(day.key+"T12:00:00Z");next.setUTCDate(next.getUTCDate()+delta);const key=next.toISOString().slice(0,10);if(min&&key<min||max&&key>max)return;
      const target=calendar.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`);target?.focus();setMonth(key.slice(0,7));if(!target)requestAnimationFrame(()=>calendar.current?.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)?.focus());
     }}>{day.day}</Button>)}
    </div>
   </PopoverContent>
  </Popover>
 </div>;
}
export function DateTimeInput({value,onValueChange,min,disabled,onBlur,ref,...props}:Props){
 const english=useLocale()==="en";
 const [state,setState]=useState({source:value,date:value.slice(0,10),time:value.slice(11,16)});
 const draft=state.source===value?state:{source:value,date:value.slice(0,10),time:value.slice(11,16)};
 function update(date:string,time:string){const source=date&&time?date+"T"+time:"";setState({source,date,time});onValueChange(source);}
 return <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_9rem] gap-2">
  <DateInput {...props} ref={ref} disabled={disabled} onBlur={onBlur} value={draft.date} min={min?.slice(0,10)} onValueChange={date=>update(date,draft.time)} />
  <Input type="time" className="min-w-0 px-2 tabular-nums" aria-label={english?"Time (Hanoi)":"Giờ (Hà Nội)"} disabled={disabled} value={draft.time} onBlur={onBlur} onChange={event=>update(draft.date,event.target.value)} />
 </div>;
}
