import {sanitizeEventContent,EventInputError} from "@/lib/admin/event-validation";
import {isTrustedMediaSource} from "@/lib/config/image-patterns";
import {normalizeTicketColor} from "@/lib/ui/ticket-color";
import {ticketPalette} from "@/lib/ui/ticket-palettes";
import type {Json} from "@/types/database";
export function draftPayload(kind:unknown,raw:unknown):Record<string,Json>{
 if(typeof kind!=="string"||!['event','article'].includes(kind)||!raw||typeof raw!=="object"||Array.isArray(raw))throw new EventInputError("Bản nháp không hợp lệ.");
 const input=raw as Record<string,unknown>;
 const data:Record<string,Json>={};
 const fields:Record<string,number>=kind==='event'?{title_vi:200,title_en:200,performer_name:160,event_date:64,end_date:64,content_vi:500000,content_en:500000,cover_image_url:2048,cover_asset_id:36,ticket_palette_key:64,ticket_palette_override:64}:{title_vi:200,title_en:200,slug:200,content_vi:500000,content_en:500000,thumbnail_url:2048};
 for(const [key,max]of Object.entries(fields)){const value=input[key];if(value==null){data[key]=null;continue;}if(typeof value!=="string"||value.length>max)throw new EventInputError("Nội dung bản nháp không hợp lệ.");if(['cover_image_url','thumbnail_url'].includes(key)&&value&&!isTrustedMediaSource(value))throw new EventInputError("Ảnh không hợp lệ.");if(['event_date','end_date'].includes(key)&&value&&(!/(Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value))))throw new EventInputError("Ngày giờ bản nháp không hợp lệ.");
 if(key==='cover_asset_id'&&value&&!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value))throw new EventInputError("Ảnh bản nháp không hợp lệ.");
 if(key==='ticket_palette_override'&&value&&!normalizeTicketColor(value)&&!ticketPalette(value))throw new EventInputError("Màu vé không hợp lệ.");
 data[key]=key.startsWith('content_')?sanitizeEventContent(value):value.trim();}
 if(kind==='event'){if(input.is_active!==undefined&&typeof input.is_active!=="boolean")throw new EventInputError("Trạng thái bản nháp không hợp lệ.");data.is_active=!!input.is_active;const fee=input.additionalFee??input.additional_fee??0;if(typeof fee!=="number"||!Number.isSafeInteger(fee)||fee<0)throw new EventInputError("Phụ thu không hợp lệ.");data.additional_fee=fee;}
 return data;
}
