import {formatDate} from "@/lib/dates";
import {Typography} from "@/components/ui/typography";
import {calendarMonth,monthDays} from "@/lib/events/calendar";
import {cn} from "@/lib/utils";

export function EventCalendar({date,english=false,className}:{date:string;english?:boolean;className?:string}) {
 const event=calendarMonth(date);
 const month=new Date(Date.UTC(event.year,event.month,1));
 const year=month.getUTCFullYear(),index=month.getUTCMonth();
 const title=new Intl.DateTimeFormat(english?"en-GB":"vi-VN",{month:"long",year:"numeric",timeZone:"UTC"}).format(month);
 return <section aria-label={english?"Event calendar":"Lịch diễn trong tháng"} className={cn("rounded-xl border border-[#2E7017]/20 bg-white/60 p-4",className)} data-event-calendar>
  <div className="mb-3 flex items-center justify-between gap-2">
   <Typography variant="small" className="font-semibold capitalize" aria-live="polite">{title}</Typography>
  </div>
  <table className="w-full table-fixed text-center text-sm" aria-label={title}>
   <thead><tr>{(english?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["T2","T3","T4","T5","T6","T7","CN"]).map(day=><th key={day} scope="col" className="pb-2 text-xs font-medium text-stone-500">{day}</th>)}</tr></thead>
   <tbody>{Array.from({length:6},(_,row)=><tr key={row}>{monthDays(year,index).slice(row*7,row*7+7).map(day=>{
    const selected=day.year===event.year&&day.month===event.month&&day.day===event.day;
    return <td key={day.key} className="p-0.5"><time dateTime={day.key} aria-label={selected?(english?"Event date: ":"Ngày diễn: ")+formatDate(day.key):undefined} data-selected={selected} className={cn("mx-auto flex size-8 items-center justify-center rounded-full",day.month!==index?"text-stone-400":"text-[#15201C]",selected&&"bg-[#2E7017] font-bold text-white ring-2 ring-[#2E7017]/20 ring-offset-2")}>{day.day}</time></td>;
   })}</tr>)}</tbody>
  </table>
 </section>;
}
