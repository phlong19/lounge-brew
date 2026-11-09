import {sanitizeEventContent,EventInputError} from "@/lib/admin/event-validation";
import type {Database} from "@/types/database";
import {isTrustedMediaSource} from "@/lib/config/image-patterns";
export function blogPayload(input:unknown){
 if(!input||typeof input!=="object"||Array.isArray(input))throw new EventInputError("Dữ liệu bài viết không hợp lệ.");
 const raw=input as Record<string,unknown>;
 const fields={title_vi:200,title_en:200,slug:200,content_vi:500000,content_en:500000,thumbnail_url:2048,published_at:64,expectedUpdatedAt:64};
 for(const key of Object.keys(raw))if(!(key in fields))throw new EventInputError("Trường không được hỗ trợ.");
 const result:Record<string,string|null>={};
 for(const [key,max]of Object.entries(fields)){
  if(key==="expectedUpdatedAt")continue;
  const v=raw[key];
  if(v===null||v===undefined||v===""){result[key]=key==="content_vi"?"":null;continue;}
  if(typeof v!=="string"||v.length>max)throw new EventInputError("Nội dung quá dài hoặc không hợp lệ.");
  result[key]=key.startsWith("content_")?sanitizeEventContent(v):v.trim();
 }
 if(!result.title_vi||!result.slug)throw new EventInputError("Vui lòng nhập tiêu đề và đường dẫn.");
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug))throw new EventInputError("Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối.");
 if(result.thumbnail_url&&!isTrustedMediaSource(result.thumbnail_url))throw new EventInputError("Ảnh bìa không hợp lệ.");
 if(result.published_at){if(!/(Z|[+-]\d{2}:\d{2})$/.test(result.published_at)||!Number.isFinite(Date.parse(result.published_at)))throw new EventInputError("Ngày xuất bản không hợp lệ.");result.published_at=new Date(result.published_at).toISOString();}
 if(raw.expectedUpdatedAt!==undefined&&(typeof raw.expectedUpdatedAt!=="string"||raw.expectedUpdatedAt.length>64||!Number.isFinite(Date.parse(raw.expectedUpdatedAt))))throw new EventInputError("Phiên bản bài viết không hợp lệ.");
 return result as Database["public"]["Tables"]["articles"]["Insert"];
}
