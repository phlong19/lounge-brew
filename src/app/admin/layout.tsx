import { AdminQueryProvider } from "@/components/admin/admin-query-provider";
import { canManageEvents } from "@/lib/admin/roles";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/vi.json";
import { AdminDesign } from "@/components/admin/admin-design";
import { Stack } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Quản lý Trixie", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  let allowed = false;
  let role = "signed-out";
  if (supabase && user) { const result = await supabase.from("staff_members").select("role,is_active").eq("user_id",user.id).maybeSingle(); allowed = canManageEvents(result.data); if(allowed && result.data)role=result.data.role; }
  return <NextIntlClientProvider locale="vi" messages={messages}><AdminQueryProvider key={(user?.id ?? "signed-out")+":"+role}>{!user ? <AdminDesign events={[]} initialLogin /> : allowed ? children : <Stack className="p-10"><Typography as="h1" variant="heading">Tài khoản chưa có quyền quản lý nội dung.</Typography></Stack>}</AdminQueryProvider></NextIntlClientProvider>;
}
