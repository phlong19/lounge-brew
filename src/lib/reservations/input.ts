import {isReservationSource,isReservationStatus,type ReservationSource,type ReservationStatus} from "@/lib/reservations/model";
import type {ReservationValues,ReservationErrors} from "@/lib/reservations/validation";
export class ReservationInputError extends Error{fields:ReservationErrors;constructor(fields:ReservationErrors={}){super("Invalid reservation input");this.fields=fields;}}
export const reservationFields=["event","name","phone","email","date","time","guests","notes"] as const;
export function isRequestKey(value:unknown):value is string{return typeof value==="string"&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);}
export function reservationInput(input:unknown,staff=false):{values:ReservationValues;idempotencyKey:string;source:ReservationSource;status:ReservationStatus}{
 if(!input||typeof input!=="object"||Array.isArray(input))throw new ReservationInputError();
 const body=input as Record<string,unknown>,allowed:string[]=[...reservationFields,"idempotencyKey","website",...(staff?["source","status"]:[])];
 if(Object.keys(body).some(key=>!allowed.includes(key))||!isRequestKey(body.idempotencyKey))throw new ReservationInputError();
 if(body.website!==undefined&&(typeof body.website!=="string"||body.website!==""))throw new ReservationInputError();
 const values={} as ReservationValues;
 for(const field of reservationFields){const value=body[field]??(["event","email","notes"].includes(field)?"":null);if(typeof value!=="string")throw new ReservationInputError();values[field]=value.normalize("NFC").trim();}
 if(values.event&&!/^[\w-]{1,80}$/.test(values.event)||values.phone.length>30||/[\u0000-\u001f\u007f]/.test(values.name))throw new ReservationInputError();
 values.email=values.email.toLowerCase();
 const source=staff?(body.source??"phone"):"website",status=staff?(body.status??"pending"):"pending";
 if(!isReservationSource(source)||!isReservationStatus(status)||!["pending","confirmed"].includes(status))throw new ReservationInputError();
 return {values,idempotencyKey:body.idempotencyKey,source,status};
}
