import type { EditableEvent } from "@/lib/admin/event-list";
export async function adminRequest(path:string,init?:RequestInit) {
  const response = await fetch(path,{...init,cache:"no-store"});
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Không thể kết nối. Vui lòng thử lại.");
  return body;
}
export async function uploadAdminImage(file:File) {
  const form = new FormData(); form.set("file",file);
  return adminRequest("/api/admin/media",{method:"POST",body:form}) as Promise<{url:string;asset:{id:string}}>;
}
export async function loadAdminEvents():Promise<EditableEvent[]> {
  const rows:EditableEvent[] = [];
  let page = 1;
  do {
    const result = await adminRequest(`/api/admin/events?page=${page}&limit=100`);
    rows.push(...result.items.map((item:EditableEvent)=>({...item,additionalFee:item.additional_fee ?? null})));
    if (rows.length >= result.total || !result.items.length) break;
    page++;
  } while(page<=100);
  return rows;
}
export async function saveAdminEvent(event:EditableEvent,isNew:boolean):Promise<EditableEvent> {
  let coverUrl = event.cover_image_url, coverId = event.cover_asset_id;
  if (event.cover_file) { const image = await uploadAdminImage(event.cover_file); coverUrl=image.url;coverId=image.asset.id; }
  const payload = {title_vi:event.title_vi,title_en:event.title_en,performer_name:event.performer_name,event_date:event.event_date,end_date:event.end_date || null,description_vi:event.description_vi,description_en:event.description_en,content_vi:event.content_vi || "",content_en:event.content_en || null,cover_image_url:coverUrl,cover_asset_id:coverId || null,is_active:event.is_active,additionalFee:event.additionalFee ?? null,...(!isNew && event.updated_at ? {expectedUpdatedAt:event.updated_at} : {})};
  const result = await adminRequest(isNew ? "/api/admin/events" : `/api/admin/events/${event.id}`,{method:isNew?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  return {...result.item,additionalFee:result.item.additional_fee ?? null};
}
