import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AdminDesign } from "@/components/admin/admin-design";
import { verifiedEvents } from "@/data/trixie-content";
import { upcomingEvents } from "@/lib/server/content-policy";
import type { AppLocale } from "@/i18n/config";
export const metadata: Metadata = { title: "Admin design preview", robots: { index: false, follow: false } };
/** Isolated public-data prototype. The real /admin authorization is unchanged. */
export default async function AdminPreview({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  return <AdminDesign events={upcomingEvents(verifiedEvents)} locale={locale as AppLocale} initialLogin={params.screen === "login"} />;
}
