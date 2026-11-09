import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {registerHooks,createRequire} from "node:module";
import {pathToFileURL} from "node:url";
import {parseDocument,DomUtils} from "htmlparser2";
import {listingEvents,originalArticle,normalizeSourceMarkup,titleDate,archivedSchedule} from "./lib/trixie-import.mjs";
if(fs.existsSync(".env.local"))process.loadEnvFile(".env.local");
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith("@/")?pathToFileURL(process.cwd()+"/src/"+specifier.slice(2)+".ts").href:specifier,context);}});
const {sanitizeEventContent}=await import("../src/lib/admin/event-validation.ts");
const {extractTicketPalette}=await import("../src/lib/media/extract-ticket-palette.ts");
const require=createRequire(import.meta.url);
const sharp=require("sharp");
const apply=process.argv.includes("--apply");
const past=process.argv.includes("--past");
const limit=past?Math.min(100,Math.max(1,Number(process.argv.find(arg=>arg.startsWith("--limit="))?.split("=")[1])||20)):Infinity;
const sourceBytes=new Map();
const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref="zcftrbvrfiypqtwhmxxj";
if(base!=="https://"+ref+".supabase.co")throw Error("Unexpected import project");
const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const {createClient}=require("@supabase/supabase-js");
async function official(url) {
 const source=new URL(url);
 if(source.protocol!=="https:"||source.hostname!=="trixie.com.vn")throw Error("Unexpected original host");
 const res=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"},redirect:"error",signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw Error("Original download failed: "+res.status);
 return res;
}
let db,publicDb;
const known=new Set();
if(apply||past||process.env.SUPABASE_SECRET_KEY){
const secret=process.env.SUPABASE_SECRET_KEY;
if(!secret?.startsWith("sb_secret_"))throw Error("A configured Supabase secret key is required for import checks.");
db=createClient(base,secret,{auth:{persistSession:false,autoRefreshToken:false}});
publicDb=createClient(base,publicKey,{auth:{persistSession:false}});
const existing=await db.from("events").select("id,source_id,updated_at").limit(10000);
if(existing.error)throw Error("Cannot check existing import records.");
for(const row of existing.data)known.add(row.source_id);
}
const events=[],skipped=[];
const fromManifest=process.argv.includes("--from-manifest");
if(fromManifest) {
 if(!past)throw Error("Staged import is available only for the reviewed archive manifest");
 const staged=JSON.parse(fs.readFileSync("supabase/imports/past-2026-10-31.json","utf8"));
 for(const event of staged.events){
  if(Date.parse(event.end_date||event.event_date)>=Date.now())throw Error("Staged record is not past");
  const checked=sanitizeEventContent(event.content_vi);
  if(DomUtils.textContent(parseDocument(checked)).replace(/\s+/g," ").trim()!==event.sourceText)throw Error("Staged article text changed");
  events.push({...event,content_vi:checked});
 }
 skipped.push(...staged.skipped);
} else {
const html=await(await official("https://trixie.com.vn/mini-show.html")).text();
const listings=listingEvents(html,{includePast:past});
for(let page=2;page<=(past?100:30);page++){
 let pageHtml;
 try {pageHtml=await(await official("https://trixie.com.vn/mini-show/page/"+page)).text();}
 catch(error){if(past){console.log("Archive pagination ended at",page);break;}throw error;}
 const more=listingEvents(pageHtml,{includePast:past});
 const unseen=more.filter(event=>!listings.some(item=>item.source_id===event.source_id));
 console.log("Listing page",page,past?"archive cards:":"upcoming cards:",more.length);
 for(const event of more)if(!listings.some(item=>item.source_id===event.source_id))listings.push(event);
 if(!more.length||past&&!unseen.length)break;
}
if(!listings.length)throw Error("No source upcoming cards found; inspect markup before importing.");
if(past)listings.sort((a,b)=>(titleDate(b.title_vi)||"").localeCompare(titleDate(a.title_vi)||""));


for(const item of listings){
 if(past&&events.length>=limit)break;
 if(known.has(item.source_id)){console.log("Existing record preserved:",item.source_id);continue;}
 if(past&&titleDate(item.title_vi)&&Date.parse(titleDate(item.title_vi)+"T00:00:00+07:00")>Date.now())continue;
 try {
 const detail=(await(await official(item.source_url)).text()).replaceAll("http://trixie.com.vn/media/","https://trixie.com.vn/media/");
 const article=originalArticle(detail,{allowMissingSchedule:past});
 if(past)Object.assign(article,archivedSchedule(item.title_vi,article));
 if(past?Date.parse(article.end_date||article.event_date)>=Date.now():Date.parse(article.event_date)<=Date.now()){console.log("Excluded started original show:",item.source_id);continue;}
 const artist=item.title_vi.split(/minishow/i)[1]?.replace(/\[?\d{1,2}[\s./-]+\d{1,2}[\s./-]+20\d{2}\]?/g,"").replace(/^[\s–—-]+|[\s–—-]+$/g,"").trim();
 if(!artist)throw Error("Cannot verify artist for "+item.source_id);
 const titleDate=item.title_vi.match(/\[(\d{2})\.(\d{2})\.(\d{4})\]/);
 if(titleDate && !article.event_date.startsWith(titleDate[3]+"-"+titleDate[2]+"-"+titleDate[1]))throw Error("Title/schedule mismatch: "+item.source_id);
 const content=sanitizeEventContent(normalizeSourceMarkup(article.content));
 const sourceText=DomUtils.textContent(parseDocument(content)).replace(/\s+/g," ").trim();
 if(sourceText!==article.rawText)throw Error("Article text changed during sanitization: "+item.source_id);
 if(past) {
  if(article.images.some(url=>!url.startsWith("https://trixie.com.vn/media/")))throw Error("Original contains unavailable or external images");
  for(const url of new Set([item.poster,...article.images])) {
   const bytes=Buffer.from(await(await official(url)).arrayBuffer());
   const metadata=await sharp(bytes,{limitInputPixels:40000000}).metadata();
   if(bytes.length>10*1024*1024||!["jpeg","png","webp"].includes(metadata.format)||metadata.pages>1)throw Error("Unsupported original image");
   sourceBytes.set(url,bytes);
  }
 }
 events.push({...item,performer_name:artist,event_date:article.event_date,end_date:article.end_date,content_vi:content,images:article.images.filter(url=>url.startsWith("https://")),unavailableImages:article.images.filter(url=>!url.startsWith("https://")),sourceText:article.rawText});
 console.log("Verified source:",item.source_id,"body characters:",article.rawText.length,"body images:",article.images.length);
 }catch(error){if(!past)throw error;skipped.push({source_id:item.source_id,reason:error.message});console.log("Skipped archive:",item.source_id,error.message);}
}
}
const dir="supabase/imports";
fs.mkdirSync(dir,{recursive:true});
const manifestName=process.argv.find(arg=>arg.startsWith("--manifest="))?.slice("--manifest=".length)|| (past?"past-2026-10-31.json":"upcoming-2026-10-30.json");
if(!/^[a-z0-9-]+\.json$/.test(manifestName))throw Error("Invalid manifest filename");
const manifest=path.join(dir,manifestName);
fs.writeFileSync(manifest,JSON.stringify({fetchedAt:new Date().toISOString(),source:"https://trixie.com.vn/mini-show.html",events,skipped},null,2)+"\n");
console.log(past?"Verified past originals:":"Verified upcoming originals:",events.length);
if(!apply){console.log("Dry run only. Use --apply to import missing records.");process.exit(0);}
// Fail before uploading if R2 or its provider-aware metadata schema is unavailable.
const {S3Client,PutObjectCommand}=require("@aws-sdk/client-s3");
const account=process.env.R2_ACCOUNT_ID,accessKeyId=process.env.R2_ACCESS_KEY_ID,secretAccessKey=process.env.R2_SECRET_ACCESS_KEY,bucket=process.env.R2_BUCKET_NAME,delivery=process.env.R2_PUBLIC_BASE_URL;
if(!account||!accessKeyId||!secretAccessKey||!bucket||!delivery)throw Error("R2 configuration is required for editorial imports; no fallback uploads.");
const deliveryUrl=new URL(delivery);
if(deliveryUrl.protocol!=="https:"||deliveryUrl.username||deliveryUrl.password||deliveryUrl.search||deliveryUrl.hash)throw Error("Invalid public R2 origin");
const r2=new S3Client({region:"auto",endpoint:`https://${account}.r2.cloudflarestorage.com`,credentials:{accessKeyId,secretAccessKey},maxAttempts:3});
const schema=await db.from("media_assets").select("provider").limit(1);
if(schema.error)throw Error("Apply the provider-aware media migration before importing.");
const assets=new Map();
async function upload(url,alt){
 if(assets.has(url))return assets.get(url);
 const bytes=sourceBytes.get(url)||Buffer.from(await(await official(url)).arrayBuffer());
 if(bytes.length>10*1024*1024)throw Error("Source image too large.");
 const metadata=await sharp(bytes,{limitInputPixels:40000000}).metadata();
 const mime={jpeg:"image/jpeg",png:"image/png",webp:"image/webp"}[metadata.format];
 if(!mime||!metadata.width||!metadata.height||metadata.pages>1)throw Error("Unsupported original image.");
 const hash=createHash("sha256").update(bytes).digest("hex");
 const objectPath="events/"+hash+"."+(metadata.format==="jpeg"?"jpg":metadata.format);
 const prior=await db.from("media_assets").select("*").eq("provider","r2").eq("bucket_id",bucket).eq("object_path",objectPath).maybeSingle();
 if(prior.error)throw Error("Cannot inspect existing image.");
 let asset=prior.data;
 if(!asset){
  await r2.send(new PutObjectCommand({Bucket:bucket,Key:objectPath,Body:bytes,ContentType:mime,CacheControl:"public, max-age=31536000, immutable"}));
  const palette=await extractTicketPalette(bytes);
  const saved=await db.from("media_assets").insert({ticket_palette_key:palette.key,ticket_palette_version:palette.version,ticket_palette_hash:palette.hash,provider:"r2",bucket_id:bucket,object_path:objectPath,original_filename:new URL(url).pathname.split("/").pop(),mime_type:mime,size_bytes:bytes.length,width:metadata.width,height:metadata.height,alt_vi:alt,source_url:url}).select().single();
  if(saved.error)throw Error("Image metadata save failed.");
  asset=saved.data;
 }
 const hosted=delivery.replace(/\/$/,"")+"/"+objectPath.split("/").map(encodeURIComponent).join("/");
 const verified=await fetch(hosted,{signal:AbortSignal.timeout(20000)});
 if(!verified.ok||createHash("sha256").update(Buffer.from(await verified.arrayBuffer())).digest("hex")!==hash)throw Error("Hosted image verification failed.");
 const result={asset,url:hosted};assets.set(url,result);return result;
}
let added=0;
for(const event of events){
 if(known.has(event.source_id)){console.log("Existing record preserved:",event.source_id);continue;}
 const poster=await upload(event.poster,event.title_vi);
 let content=event.content_vi;
 for(const url of event.images){
  const image=await upload(url,event.title_vi);
  content=content.split(url.replaceAll("&","&amp;")).join(image.url);
 }
 const saved=await db.from("events").insert({source_id:event.source_id,source_url:event.source_url,title_vi:event.title_vi,title_en:null,performer_name:event.performer_name,event_date:event.event_date,end_date:event.end_date,content_vi:content,content_en:null,cover_asset_id:poster.asset.id,cover_image_url:poster.url,is_active:true,additional_fee:0}).select("id,public_id,content_vi,cover_image_url").single();
 if(saved.error)throw Error("Event save failed for "+event.source_id+": "+saved.error.code);
 const actual=DomUtils.textContent(parseDocument(saved.data.content_vi)).replace(/\s+/g," ").trim();
 if(actual!==event.sourceText)throw Error("Stored article verification failed");
 const visible=await publicDb.from("events").select("id").eq("id",saved.data.id).maybeSingle();
 if(visible.error||!visible.data)throw Error("Imported show not publicly readable");
 added++;console.log("Imported original:",saved.data.public_id);
}
console.log(JSON.stringify({imported:added,preserved:events.length-added,uniqueImagesVerified:assets.size}));
