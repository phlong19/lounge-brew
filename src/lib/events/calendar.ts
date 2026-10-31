export function calendarMonth(value: string) {
 const parts=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"numeric",day:"numeric",timeZone:"Asia/Ho_Chi_Minh"}).formatToParts(new Date(value));
 const part=(type:string)=>Number(parts.find(p=>p.type===type)?.value);
 return {year:part("year"),month:part("month")-1,day:part("day")};
}
export function monthDays(year:number,month:number) {
 const offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
 return Array.from({length:42},(_,index)=>{
  const value=new Date(Date.UTC(year,month,index-offset+1));
  return {year:value.getUTCFullYear(),month:value.getUTCMonth(),day:value.getUTCDate(),key:value.toISOString().slice(0,10)};
 });
}
