import type {Metadata} from "next";
import type {ReactNode} from "react";
import {NextIntlClientProvider} from "next-intl";
import messages from "../../../messages/vi.json";
import {AdminQueryProvider} from "@/components/admin/admin-query-provider";
import {AdminShell} from "@/components/admin/admin-shell";
import {AdminLogin} from "@/components/admin/admin-login";
import type {StaffInfo} from "@/components/admin/staff-menu";
import {canAccessAdmin} from "@/lib/admin/roles";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export const metadata:Metadata={title:"Quản lý Trixie",robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:ReactNode}){
 const supabase=await createSupabaseServerClient(),user=supabase?(await supabase.auth.getUser()).data.user:null;
 let staff:StaffInfo|null=null;
 if(supabase&&user){const result=await supabase.from("staff_members").select("role,is_active,display_name").eq("user_id",user.id).maybeSingle(),access=await supabase.rpc("staff_access_allowed");if(canAccessAdmin(result.data)&&!access.error&&access.data===true)staff={email:user.email??"",name:result.data.display_name,role:result.data.role};}
 return <NextIntlClientProvider locale="vi" messages={messages}><AdminQueryProvider key={(user?.id??"signed-out")+":"+(staff?.role??"signed-out")}>{staff?<AdminShell staff={staff}>{children}</AdminShell>:<AdminLogin />}</AdminQueryProvider></NextIntlClientProvider>;
}
