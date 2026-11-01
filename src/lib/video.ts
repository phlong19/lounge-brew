import {homeVideo} from "@/data/home-video";
export type VideoProvider="YouTube"|"Facebook"|"Vimeo"|"Video";
export type ParsedVideo={provider:VideoProvider;src:string;native?:boolean};
export type VideoSettings={id:string;source_url:string;provider:VideoProvider;heading_vi:string;heading_en:string|null;is_visible:boolean;updated_at:string};
export const videoSelect="id,source_url,provider,heading_vi,heading_en,is_visible,updated_at";
export const defaultVideoSettings:VideoSettings={id:"home",source_url:homeVideo.sourceUrl,provider:"YouTube",heading_vi:"Video quán cafe Trixie Hà Nội",heading_en:"Trixie on video",is_visible:true,updated_at:"1970-01-01T00:00:00.000Z"};
export function parseVideo(value:string):ParsedVideo|null{
 try{
  const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.port&&u.port!=="443")return null;
  const host=u.hostname.toLowerCase();
  if(["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com"].includes(host)){
   const id=host==="youtu.be"?u.pathname.slice(1):u.searchParams.get("v")||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
   return id&&/^[\w-]{11}$/.test(id)?{provider:"YouTube",src:`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`}:null;
  }
  if(["facebook.com","www.facebook.com","m.facebook.com"].includes(host)&&(/\/videos\/\d+(?:\/|$)/.test(u.pathname)||/^\/reel\/\d+(?:\/|$)/.test(u.pathname)||/^\d+$/.test(u.searchParams.get("v")??"")))return {provider:"Facebook",src:`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false`};
  if(["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(host)){
   const match=u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-f\d]+))?\/?$/i),hash=u.searchParams.get("h")||match?.[2];
   return match?{provider:"Vimeo",src:`https://player.vimeo.com/video/${match[1]}${hash?"?h="+encodeURIComponent(hash):""}`}:null;
  }
  if(/\.(?:mp4|webm)$/i.test(u.pathname))return {provider:"Video",src:u.href,native:true};
 }catch{return null;}
 return null;
}
export class VideoInputError extends Error{}
export function videoInput(value:unknown){
 if(!value||typeof value!=="object"||Array.isArray(value))throw new VideoInputError("Dữ liệu video không hợp lệ.");
 const body=value as Record<string,unknown>;
 if(Object.keys(body).some(key=>!["source_url","heading_vi","heading_en","is_visible","expectedUpdatedAt"].includes(key)))throw new VideoInputError("Có trường video không được hỗ trợ.");
 if(typeof body.source_url!=="string"||body.source_url.length>2048||!parseVideo(body.source_url.trim()))throw new VideoInputError("Liên kết video không hợp lệ.");
 if(typeof body.heading_vi!=="string"||!body.heading_vi.trim()||body.heading_vi.trim().length>200||/[\u0000-\u001f\u007f]/.test(body.heading_vi))throw new VideoInputError("Nhập tiêu đề tiếng Việt từ 1 đến 200 ký tự.");
 if(body.heading_en!==null&&typeof body.heading_en!=="string"||typeof body.heading_en==="string"&&(body.heading_en.trim().length>200||/[\u0000-\u001f\u007f]/.test(body.heading_en)))throw new VideoInputError("Tiêu đề tiếng Anh không hợp lệ.");
 if(typeof body.is_visible!=="boolean"||typeof body.expectedUpdatedAt!=="string"||body.expectedUpdatedAt.length>64||!Number.isFinite(Date.parse(body.expectedUpdatedAt)))throw new VideoInputError("Trạng thái hoặc phiên bản video không hợp lệ.");
 return {source_url:body.source_url.trim(),provider:parseVideo(body.source_url.trim())!.provider,heading_vi:body.heading_vi.trim().normalize("NFC"),heading_en:typeof body.heading_en==="string"?body.heading_en.trim().normalize("NFC")||null:null,is_visible:body.is_visible,expectedUpdatedAt:body.expectedUpdatedAt};
}
