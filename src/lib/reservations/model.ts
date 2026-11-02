import type {Database} from "@/types/database";
export const reservationStatuses=["pending","confirmed","unreachable","declined","cancelled"] as const;
export type ReservationStatus=typeof reservationStatuses[number];
export const reservationSources=["website","facebook","zalo","phone","other"] as const;
export type ReservationSource=typeof reservationSources[number];
export const statusLabels:Record<ReservationStatus,string>={pending:"Chờ xác nhận",confirmed:"Đã xác nhận",unreachable:"Không liên hệ được",declined:"Từ chối",cancelled:"Đã hủy"};
export const sourceLabels:Record<ReservationSource,string>={website:"Website",facebook:"Facebook",zalo:"Zalo",phone:"Điện thoại",other:"Khác"};
export function isReservationStatus(value:unknown):value is ReservationStatus{return reservationStatuses.includes(value as ReservationStatus);}
export function isReservationSource(value:unknown):value is ReservationSource{return reservationSources.includes(value as ReservationSource);}
export function reservationTransitions(status:ReservationStatus):ReservationStatus[]{
 if(status==="pending")return ["confirmed","unreachable","declined","cancelled"];
 return status==="confirmed"?["cancelled"]:["pending"];
}
export type ReservationItem=Omit<Database["public"]["Tables"]["reservations"]["Row"],"idempotency_key"|"phone_normalized">&{event:{title_vi:string;performer_name:string;public_id:string}|null};
export type ReservationHistory={id:number;action:string;actor_name:string;created_at:string;previous_status:ReservationStatus|null;new_status:ReservationStatus|null;changed_fields:string[]};
export type ReservationDetail={item:ReservationItem;history:ReservationHistory[]};
export type ReservationList={items:ReservationItem[];total:number;page:number;limit:number};
export type ReservationSummary={pending:number;latest:{id:string;created_at:string}|null};
export type EventChoice={id:string;label:string;date:string;time:string;startsAt?:string};
export function normalizePhone(value:string){
 const digits=value.replace(/\D/g,"");
 if(digits.startsWith("0084"))return "84"+digits.slice(4).replace(/^0+/,"");
 if(digits.startsWith("84"))return "84"+digits.slice(2).replace(/^0+/,"");
 return digits.startsWith("0")?"84"+digits.slice(1):digits;
}
