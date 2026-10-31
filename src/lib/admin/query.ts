import {QueryClient} from "@tanstack/react-query";
import {AdminRequestError} from "@/lib/admin/client";
export const adminKeys = {
 events:["admin","events"] as const,
 seating:["admin","seating"] as const,
 staff:["admin","staff"] as const,
};
export function createAdminQueryClient() {
 return new QueryClient({defaultOptions:{
  queries:{staleTime:30000,gcTime:300000,refetchOnWindowFocus:false,retry:(count,error)=>count<1&&!(error instanceof AdminRequestError&&error.status<500)},
  mutations:{retry:false},
 }});
}
