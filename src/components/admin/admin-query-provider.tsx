"use client";
import {useState,type ReactNode} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {createAdminQueryClient} from "@/lib/admin/query";
export function AdminQueryProvider({children}:{children:ReactNode}) {
 const [client]=useState(createAdminQueryClient);
 return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
