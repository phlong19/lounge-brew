import { cache } from "react";
import { verifiedEvents } from "@/data/trixie-content";
import { seatingSelect, type SeatingSettings } from "@/lib/seating";
import { isBookableEvent, upcomingEvents } from "@/lib/server/content-policy";
import type { EventRow } from "@/types/domain";

async function publicRows<T>(table: string, query: string, tag: string): Promise<T[]> {
 const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!base || !key) return [];
 // Anonymous requests only: never cache a staff session or private event data.
 const response = await fetch(`${base}/rest/v1/${table}?${query}`, {
  headers: { apikey: key }, next: { revalidate: 60, tags: [tag] },
  signal: AbortSignal.timeout(5000),
 });
 if (!response.ok) throw new Error("Public event extras unavailable");
 return response.json() as Promise<T[]>;
}
export const getSeatingSettings = cache(async (): Promise<SeatingSettings | null> => {
 try { return (await publicRows<SeatingSettings>("seating_settings", `select=${encodeURIComponent(seatingSelect)}&id=eq.home&is_visible=eq.true`, "seating-settings"))[0] ?? null; }
 catch { return null; }
});
export const getOtherUpcomingEvents = cache(async (currentId: string): Promise<EventRow[]> => {
 const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
 try {
  const fields = "id,public_id,title_vi,title_en,performer_name,event_date,end_date,cover_image_url,is_active,is_deleted";
  // Minute bucket shares results across all detail URLs; expired shows are filtered again below.
  const minute = new Date(Math.floor(Date.now()/60000)*60000).toISOString();
  const rows = configured ? await publicRows<EventRow>("events", `select=${fields}&is_active=eq.true&is_deleted=eq.false&event_date=gte.${minute}&order=event_date.asc,id.asc&limit=30`, "upcoming-events") : verifiedEvents;
  return rows.filter(row => (row.public_id || row.id) !== currentId && isBookableEvent(row)).slice(0,12);
 } catch { return []; }
});

/** Shared anonymous summary dataset; never serialize full articles or staff fields. */
export const getPublicEvents = cache(async ():Promise<EventRow[]>=>{
 const fields="id,public_id,title_vi,title_en,performer_name,event_date,end_date,cover_image_url,is_active,is_deleted";
 const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
 const minute=new Date(Math.floor(Date.now()/60000)*60000).toISOString();
 const rows=configured?await publicRows<EventRow>("events",`select=${fields}&is_active=eq.true&is_deleted=eq.false&or=(end_date.gte.${minute},event_date.gte.${minute})&order=event_date.asc,id.asc`,"upcoming-events"):verifiedEvents;
 return upcomingEvents(rows).map(row=>({
  id:row.id,public_id:row.public_id,title_vi:row.title_vi,title_en:row.title_en??null,
  performer_name:row.performer_name,event_date:row.event_date,end_date:row.end_date??null,
  cover_image_url:row.cover_image_url??null,is_active:true,is_deleted:false,
  description_vi:null,description_en:null,
 }));
});
/** Transport failures must reject so React Query can retain its previous data. */
export const readPublicSeating = cache(async ():Promise<SeatingSettings|null>=>
 (await publicRows<SeatingSettings>("seating_settings",`select=${encodeURIComponent(seatingSelect)}&id=eq.home&is_visible=eq.true`,"seating-settings"))[0]??null);
