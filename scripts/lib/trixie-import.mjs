import {parseDocument,DomUtils} from "htmlparser2";
const classes=node=>(node.attribs?.class||"").split(/\s+/);
const all=(root,predicate)=>DomUtils.findAll(predicate,root.children);
const text=node=>DomUtils.textContent(node).replace(/\s+/g," ").trim();
export function listingEvents(html, {includePast=false} = {}) {
 const doc=parseDocument(html);
 const images=all(doc,n=>n.name==="div"&&classes(n).includes("image"));
 return images.flatMap(node=>{
  const link=all(node,n=>n.name==="a"&&classes(n).includes("std")&&/-E\d+\.html$/.test(n.attribs.href||""))[0];
  const poster=all(node,n=>n.name==="img")[0];
  if(!link || !poster || (!includePast && !all(node,n=>classes(n).includes("enable_event")).length))return [];
  return [{source_url:link.attribs.href,title_vi:text(link),poster:poster.attribs.src,source_id:link.attribs.href.match(/-E(\d+)\.html$/)[1]}];
 });
}
export function originalArticle(html, {allowMissingSchedule=false} = {}) {
 const doc=parseDocument(html);
 const article=all(doc,n=>classes(n).includes("pageText"))[0];
 if(!article)throw Error("Original article container missing");
 // Shared seating belongs to venue settings. Do not include its heading or images.
 let boundary=false;
 function trim(node) {
  if(boundary)return null;
  if(/^Sơ đồ (?:vị trí ngồi|chỗ ngồi)/i.test(text(node))){boundary=true;return null;}
  if(node.children) {
   const children=[];
   for(const child of node.children) { const kept=trim(child); if(kept)children.push(kept); }
   return {...node,children};
  }
  return node;
 }
 const children=[];
 for(const node of article.children) {const kept=trim(node);if(kept)children.push(kept);}
 const content=children.map(DomUtils.getOuterHTML).join("").trim();
 const rawText=children.map(n=>DomUtils.textContent(n)).join("").replace(/\s+/g," ").trim();
 const schedule=rawText.match(/Thời gian\s*:\s*Từ\s*(\d{1,2})[h:](\d{2})\s*(?:->|–|—|-)\s*(\d{1,2})[h:](\d{2})[^\n]*?(\d{1,2})[/.](\d{1,2})[/.](20\d{2})/i);
 if(!schedule) {
  if(!allowMissingSchedule)throw Error("Cannot verify original schedule");
  const images=all({children},n=>n.name==="img").map(n=>n.attribs.src).filter(Boolean);
  return {content,rawText,event_date:null,end_date:null,images:[...new Set(images)]};
 }
 const [,hour,minute,endHour,endMinute,day,month,year]=schedule;
 const local=year+"-"+month.padStart(2,"0")+"-"+day.padStart(2,"0");
 const event_date=local+"T"+hour.padStart(2,"0")+":"+minute+":00+07:00";
 const end_date=local+"T"+endHour.padStart(2,"0")+":"+endMinute+":00+07:00";
 if(!Number.isFinite(Date.parse(event_date))||Date.parse(end_date)<Date.parse(event_date))throw Error("Invalid original schedule");
 const images=all({children},n=>n.name==="img").map(n=>n.attribs.src).filter(Boolean);
 return {content,rawText,event_date,end_date,images:[...new Set(images)]};
}
export function normalizeSourceMarkup(html) {
 return html.replace(/<(\/?)(h1)(?=[ >])/gi,"<$1h2").replace(/<(\/?)(h[4-6])(?=[ >])/gi,"<$1h3")
 .replace(/<(\/?)b(?=[ >])/gi,"<$1strong").replace(/<(\/?)i(?=[ >])/gi,"<$1em");
}

export function titleDate(title) {
 const match=title.match(/(\d{1,2})[\s./-]+(\d{1,2})[\s./-]+(20\d{2})/);
 if(!match)return null;
 const value=match[3]+"-"+match[2].padStart(2,"0")+"-"+match[1].padStart(2,"0");
 const parsed=new Date(value+"T00:00:00Z");
 return Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===value?value:null;
}
export function archivedSchedule(title,article) {
 const date=titleDate(title);
 if(article.event_date) {
  if(date&&!article.event_date.startsWith(date))throw Error("Title/schedule mismatch");
  return {event_date:article.event_date,end_date:article.end_date};
 }
 if(!date)throw Error("No verified original date");
 const time=article.rawText.match(/(?:thời gian|bắt đầu|vào lúc|lúc)\s*:?\s*(?:từ\s*)?(\d{1,2})[h:](\d{2})(?:\s*(?:->|–|—|-)\s*(\d{1,2})[h:](\d{2}))?/i);
 if(!time)throw Error("No verified original start time");
 const [,hour,minute,endHour,endMinute]=time;
 if(Number(hour)>23||Number(minute)>59||endHour&&Number(endHour)>23||endMinute&&Number(endMinute)>59)throw Error("Invalid original time");
 const event_date=date+"T"+hour.padStart(2,"0")+":"+minute+":00+07:00";
 const end_date=endHour?date+"T"+endHour.padStart(2,"0")+":"+endMinute+":00+07:00":null;
 if(end_date&&Date.parse(end_date)<Date.parse(event_date))throw Error("Invalid original time range");
 return {event_date,end_date};
}
