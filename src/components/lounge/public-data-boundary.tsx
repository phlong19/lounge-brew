import type {ReactNode} from "react";
import {dehydrate,HydrationBoundary} from "@tanstack/react-query";
import {createPublicQueryClient,publicKeys} from "@/lib/public/query";
import {getPublicEvents,readPublicSeating,readPublicVideo} from "@/lib/server/event-extras";
export async function PublicDataBoundary({children,seating=false,video=false}:{children:ReactNode;seating?:boolean;video?:boolean}){
 const client=createPublicQueryClient();
 await Promise.all([client.prefetchQuery({queryKey:publicKeys.events,queryFn:getPublicEvents,retry:false}),...(seating?[client.prefetchQuery({queryKey:publicKeys.seating,queryFn:readPublicSeating,retry:false})]:[]),...(video?[client.prefetchQuery({queryKey:publicKeys.video,queryFn:readPublicVideo,retry:false})]:[])]);
 return <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>;
}
