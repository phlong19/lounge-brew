import {formatDate} from "@/lib/dates";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { AppLocale } from "@/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEventDate(value: string, locale: AppLocale) {
  return formatDate(value)+" · "+new Intl.DateTimeFormat(locale==="vi"?"vi-VN":"en-GB",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(value));
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
