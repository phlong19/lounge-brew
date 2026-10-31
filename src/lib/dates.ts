/** All full dates use dd/MM/yyyy; persisted dates remain ISO in Hanoi time. */
export function isCalendarDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function formatDate(value:string){
 if(isCalendarDate(value))return value.slice(8,10)+"/"+value.slice(5,7)+"/"+value.slice(0,4);
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return "";
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return "";
 const parts=new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Asia/Ho_Chi_Minh"}).formatToParts(date);
 const part=(key:string)=>parts.find(item=>item.type===key)?.value??"";
 return part("day")+"/"+part("month")+"/"+part("year");
}
export function parseDisplayDate(value:string){
 const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
 if(!match)return "";
 const iso=match[3]+"-"+match[2]+"-"+match[1];
 return isCalendarDate(iso)?iso:"";
}
export function maskDate(value:string){
 if(isCalendarDate(value))return formatDate(value);
 const digits=value.replace(/\D/g,"").slice(0,8);
 return [digits.slice(0,2),digits.slice(2,4),digits.slice(4)].filter(Boolean).join("/");
}
