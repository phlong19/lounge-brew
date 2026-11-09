import type { EditableEvent } from "@/lib/admin/event-list";
export class AdminRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function adminRequest(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, cache: "no-store" });
  const body = await response.json();
  if (!response.ok)
    throw new AdminRequestError(
      body.error || "Không thể kết nối. Vui lòng thử lại.",
      response.status,
    );
  return body;
}
export async function uploadAdminImage(
  file: File,
  purpose: "event" | "blog" | "core" = "event",
  sessionId?:string,
) {
  const form = new FormData();
  form.set("file", file);
  form.set("purpose", purpose);
  if(sessionId)form.set("sessionId",sessionId);
  return adminRequest("/api/admin/media", {
    method: "POST",
    body: form,
  }) as Promise<{ url: string; asset: { id: string; ticket_palette_key?: string | null } }>;
}
export async function loadAdminEvents(
  signal?: AbortSignal,
): Promise<EditableEvent[]> {
  const rows: EditableEvent[] = [];
  let page = 1;
  do {
    const result = await adminRequest(
      `/api/admin/events?page=${page}&limit=100`,
      { signal },
    );
    rows.push(
      ...result.items.map((item: EditableEvent) => ({
        ...item,
        additionalFee: item.additional_fee ?? 0,
      })),
    );
    if (rows.length >= result.total || !result.items.length) break;
    page++;
  } while (page <= 100);
  return rows;
}
export async function saveAdminEvent(
  event: EditableEvent,
  isNew: boolean,
  mediaSession:string|undefined=event.media_session,
): Promise<EditableEvent> {
  let coverUrl = event.cover_image_url,
    coverId = event.cover_asset_id;
  if (event.cover_file) {
    const image = await uploadAdminImage(event.cover_file,"event",mediaSession);
    coverUrl = image.url;
    coverId = image.asset.id;
  }
  const payload = {
    media_session:mediaSession,
    ...(event.is_draft?{draft_id:event.id}:{}),
    title_vi: event.title_vi,
    title_en: event.title_en,
    performer_name: event.performer_name,
    event_date: event.event_date,
    end_date: event.end_date || null,
    content_vi: event.content_vi || "",
    content_en: event.content_en || null,
    cover_image_url: coverUrl,
    cover_asset_id: coverId || null,
    is_active: event.is_active,
    ticket_palette_override: event.ticket_palette_override ?? null,
    additionalFee: event.additionalFee ?? null,
    ...(!isNew && event.updated_at
      ? { expectedUpdatedAt: event.updated_at }
      : {}),
  };
  const result = await adminRequest(
    isNew||event.is_draft ? "/api/admin/events" : `/api/admin/events/${event.id}`,
    {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return { ...result.item, additionalFee: result.item.additional_fee ?? 0 };
}
