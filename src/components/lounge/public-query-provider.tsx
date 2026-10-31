"use client";
import {useState,type ReactNode} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {createPublicQueryClient} from "@/lib/public/query";
export function PublicQueryProvider({children}:{children:ReactNode}){
 const [client]=useState(createPublicQueryClient);
 return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
