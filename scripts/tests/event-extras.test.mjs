import {test} from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {pathToFileURL} from "node:url";
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith("@/")?pathToFileURL(process.cwd()+"/src/"+specifier.slice(2)+".ts").href:specifier,context);}});
const {getOtherUpcomingEvents,getSeatingSettings,getPublicEvents,readPublicSeating}=await import("../../src/lib/server/event-extras.ts");
test("anonymous cached extras exclude current, hidden, deleted and started shows",async()=>{
 const previousFetch=globalThis.fetch;
 const old=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";
 process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="public-test-key";
 const calls=[];
 const base={title_vi:"Programme",title_en:null,performer_name:"Artist",cover_image_url:null,is_active:true,event_date:new Date(Date.now()+3600000).toISOString()};
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json(url.includes("seating_settings")?[]:[
  {...base,id:"internal-current",public_id:"current"},{...base,id:"future"},
  {...base,id:"hidden",is_active:false},{...base,id:"deleted",is_deleted:true},
  {...base,id:"started",event_date:new Date(Date.now()-1000).toISOString()},
 ]);};
 try {
  assert.deepEqual((await getOtherUpcomingEvents("current")).map(e=>e.id),["future"]);
  assert.equal(await getSeatingSettings(),null);
  assert.equal(calls[0].options.next.revalidate,60);
  assert.deepEqual(calls[0].options.next.tags,["upcoming-events"]);
  assert.deepEqual(Object.keys(calls[0].options.headers),["apikey"]);
  assert(!calls[0].url.includes("content_vi"));
  assert(calls[0].url.includes("is_deleted=eq.false"));
  assert.deepEqual(calls[1].options.next.tags,["seating-settings"]);
  globalThis.fetch=async()=>Response.json([]);
  assert.deepEqual(await getOtherUpcomingEvents("current"),[]);
  globalThis.fetch=async()=>{throw Error("offline");};
  assert.deepEqual(await getOtherUpcomingEvents("current"),[]);
  assert.equal(await getSeatingSettings(),null);
 } finally {
  globalThis.fetch=previousFetch;
  if(old===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=old;
  if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=oldKey;
 }
});

test("public summary loaders remain anonymous, filter ended/hidden records and distinguish empty seating from failures",async()=>{
 const previousFetch=globalThis.fetch,old=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="public-test-key";
 const base={id:"visible",title_vi:"Show",is_active:true,event_date:new Date(Date.now()+3600000).toISOString()};
 globalThis.fetch=async(url,options)=>{assert.deepEqual(Object.keys(options.headers),["apikey"]);assert(!url.includes("content_vi"));return Response.json([{...base,id:"later",event_date:new Date(Date.now()+7200000).toISOString()},base,{...base,id:"hidden",is_active:false},{...base,id:"deleted",is_deleted:true},{...base,id:"ended",event_date:new Date(Date.now()-10000).toISOString()}]);};
 try{
  const summaries=await getPublicEvents();assert.deepEqual(summaries.map(row=>row.id),["visible","later"]);assert(summaries.every(row=>!("content_vi" in row)));
  globalThis.fetch=async()=>Response.json([]);assert.deepEqual(await getPublicEvents(),[]);assert.equal(await readPublicSeating(),null);
  globalThis.fetch=async()=>{throw Error("offline");};await assert.rejects(getPublicEvents());await assert.rejects(readPublicSeating());
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert((await getPublicEvents()).every(row=>!("content_vi" in row)&&!("source_url" in row)));
 }finally{globalThis.fetch=previousFetch;if(old===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=old;if(oldKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=oldKey;}
});
