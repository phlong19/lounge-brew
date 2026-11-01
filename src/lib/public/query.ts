import type {VideoSettings} from "@/lib/video";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import type { EventRow } from "@/types/domain";
import type { SeatingSettings } from "@/lib/seating";
export const publicKeys={video:["public","video"] as const,events:["public","events"] as const,seating:["public","seating"] as const};
export class PublicRequestError extends Error {status:number;constructor(status:number){super("Public content unavailable");this.status=status;}}
async function read<T>(path:string,signal?:AbortSignal):Promise<T>{
 const response=await fetch(path,{signal,credentials:"omit"});
 if(!response.ok)throw new PublicRequestError(response.status);
 return response.json() as Promise<T>;
}
export const publicEventsOptions=()=>queryOptions({queryKey:publicKeys.events,queryFn:({signal})=>read<EventRow[]>("/api/public/events",signal),staleTime:60000,refetchInterval:60000,refetchIntervalInBackground:false});
export const publicSeatingOptions=()=>queryOptions({queryKey:publicKeys.seating,queryFn:({signal})=>read<SeatingSettings|null>("/api/public/seating",signal),staleTime:60000});
export const publicVideoOptions=()=>queryOptions({queryKey:publicKeys.video,queryFn:({signal})=>read<VideoSettings|null>("/api/public/video",signal),staleTime:60000,refetchOnWindowFocus:true,refetchInterval:60000,refetchIntervalInBackground:false});
export function createPublicQueryClient(){return new QueryClient({defaultOptions:{queries:{staleTime:60000,gcTime:300000,retry:(count,error)=>count<1&&!(error instanceof PublicRequestError&&error.status<500)}}});}
