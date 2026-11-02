import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import messages from "../../../messages/vi.json";
import {AdminQueryProvider} from "@/components/admin/admin-query-provider";
import {AdminShell} from "@/components/admin/admin-shell";
import {AdminLogin} from "@/components/admin/admin-login";
import type {StaffInfo} from "@/components/admin/staff-menu";
import {requireStaff} from "@/lib/server/admin-api";
export const metadata:Metadata={title:"Quản lý Trixie",robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:ReactNode}){
 let staff:StaffInfo|null=null,userId="signed-out";
 try{const verified=await requireStaff();userId=verified.user.id;staff={email:verified.user.email??"",name:verified.displayName,role:verified.role};}catch{}

 return <NextIntlClientProvider locale="vi" messages={messages}><AdminQueryProvider key={userId+":"+(staff?.role??"signed-out")}>{staff?<AdminShell staff={staff}>{children}</AdminShell>:<AdminLogin />}</AdminQueryProvider></NextIntlClientProvider>;
}
