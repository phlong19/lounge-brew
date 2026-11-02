"use client";
import {useEffect,useRef,useState} from "react";
import type {Session} from "@supabase/supabase-js";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {adminRequest} from "@/lib/admin/client";
import {adminKeys} from "@/lib/admin/query";
import type {ReservationSummary} from "@/lib/reservations/model";
import {createSupabaseBrowserClient} from "@/lib/supabase/browser";
export function useReservationNotifications(enabled:boolean){
 const client=useQueryClient(),seen=useRef<string|undefined>(undefined),[notice,setNotice]=useState(false);
 const summary=useQuery<ReservationSummary>({queryKey:adminKeys.reservationSummary,queryFn:({signal})=>adminRequest("/api/admin/reservations/summary",{signal}),enabled,refetchInterval:30000,refetchOnWindowFocus:true,refetchOnReconnect:true});
 useEffect(()=>{if(!summary.data)return;const latest=summary.data.latest?.id??"";if(seen.current!==undefined&&seen.current!==latest&&latest){setNotice(true);void client.invalidateQueries({queryKey:adminKeys.reservations});}seen.current=latest;},[summary.data,client]);
 useEffect(()=>{
  if(!enabled)return;const supabase=createSupabaseBrowserClient();if(!supabase)return;let active=true;let channel:ReturnType<typeof supabase.channel>|undefined;
  void supabase.auth.getSession().then(async({data}:{data:{session:Session|null}})=>{if(!active||!data.session)return;await supabase.realtime.setAuth(data.session.access_token);if(!active)return;
   channel=supabase.channel("staff-reservation-inbox").on("postgres_changes",{event:"*",schema:"public",table:"reservations"},()=>{void client.invalidateQueries({queryKey:adminKeys.reservations});void client.invalidateQueries({queryKey:adminKeys.reservationSummary});}).subscribe();
  });return()=>{active=false;if(channel)void supabase.removeChannel(channel);};
 },[enabled,client]);
 return {pending:summary.data?.pending??0,notice,dismiss:()=>setNotice(false)};
}
