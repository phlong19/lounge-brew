import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import {LoadingTransitionProvider} from "@/components/content/landing-loading";
import {PublicQueryProvider} from "@/components/lounge/public-query-provider";
import { ReservationProvider } from "@/components/lounge/reservation-provider";

import { surfaceStyles } from "@/lib/ui/styles";
import { cn } from "@/lib/utils";

import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: {
      default: "Trixie Café & Lounge",
      template: "%s | Trixie Café & Lounge",
    },
    description:
      locale === "vi"
        ? "Khám phá thực đơn, lịch minishow và không gian Trixie Café & Lounge tại 165 Thái Hà, Hà Nội."
        : "Explore the menu, live shows and spaces at Trixie Café & Lounge, 165 Thai Ha, Hanoi.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, messages] = await Promise.all([
    getLocale().catch(() => "vi"),
    getMessages().catch(() => null),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(sans.className, surfaceStyles.paper, "antialiased")}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages ?? undefined}
        >
          <LoadingTransitionProvider initialEnglish={locale==="en"}><PublicQueryProvider><ReservationProvider>{children}</ReservationProvider></PublicQueryProvider></LoadingTransitionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
