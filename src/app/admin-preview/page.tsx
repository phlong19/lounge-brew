import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/vi.json";
import { AdminDesign } from "@/components/admin/admin-design";
import { verifiedEvents } from "@/data/trixie-content";
export const metadata: Metadata = { title: "Quản lý Trixie", robots: { index: false, follow: false } };
/** Isolated public-data prototype. The real /admin authorization is unchanged. */
export default async function AdminPreview({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
  const params = await searchParams;
  return <NextIntlClientProvider locale="vi" messages={messages}><AdminDesign events={verifiedEvents} initialLogin={params.screen === "login"} /></NextIntlClientProvider>;
}
