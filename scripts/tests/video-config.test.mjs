import {test} from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {pathToFileURL} from "node:url";
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith("@/")?pathToFileURL(process.cwd()+"/src/"+specifier.slice(2)+".ts").href:specifier,context);}});
const {parseVideo,videoInput}=await import("../../src/lib/video.ts");
const {readPublicVideo}=await import("../../src/lib/server/event-extras.ts");
const valid={source_url:"https://www.youtube.com/watch?v=gOvPXjqWn1A",heading_vi:" Video Trixie ",heading_en:" ",is_visible:true,expectedUpdatedAt:"2026-11-01T00:00:00.000Z"};
test("supported video URLs derive controlled embeds and retain native/privacy parameters",()=>{
 for(const url of [valid.source_url,"https://youtu.be/gOvPXjqWn1A?t=30","https://www.youtube.com/shorts/gOvPXjqWn1A","https://www.youtube-nocookie.com/embed/gOvPXjqWn1A"])assert.equal(parseVideo(url).src,"https://www.youtube-nocookie.com/embed/gOvPXjqWn1A?rel=0&playsinline=1");
 assert.equal(parseVideo("https://www.facebook.com/watch/?v=123456").provider,"Facebook");assert.equal(new URL(parseVideo("https://www.facebook.com/watch/?v=123456").src).hostname,"www.facebook.com");
 assert.equal(parseVideo("https://vimeo.com/123456/ab12cd").src,"https://player.vimeo.com/video/123456?h=ab12cd");
 assert.equal(parseVideo("https://player.vimeo.com/video/123456?h=ab12cd").src,"https://player.vimeo.com/video/123456?h=ab12cd");
 assert.deepEqual(parseVideo("https://media.example.com/movie.mp4?version=2"),{provider:"Video",native:true,src:"https://media.example.com/movie.mp4?version=2"});
 for(const url of ["http://youtu.be/gOvPXjqWn1A","javascript:alert(1)","data:video/mp4;base64,a","https://user:password@youtu.be/gOvPXjqWn1A","https://youtu.be:123/gOvPXjqWn1A","https://youtube.com.evil.example/watch?v=gOvPXjqWn1A","https://www.youtube.com/watch?v=bad","https://www.facebook.com/watch/?v=bad","https://example.com/embed/123"])assert.equal(parseVideo(url),null,url);
});
test("settings normalize optional translation and reject provider/actor spoofing and invalid versions",()=>{
 const row=videoInput(valid);assert.equal(row.provider,"YouTube");assert.equal(row.heading_vi,"Video Trixie");assert.equal(row.heading_en,null);
 for(const body of [null,[],{...valid,heading_vi:" "},{...valid,heading_en:"x".repeat(201)},{...valid,heading_vi:"Bad\nTitle"},{...valid,is_visible:"true"},{...valid,expectedUpdatedAt:null},{...valid,provider:"Vimeo"},{...valid,updated_by:"actor"},{...valid,id:"other"},{...valid,source_url:"javascript:alert(1)"}])assert.throws(()=>videoInput(body));
});
test("public reads stay anonymous, preserve hidden/missing configuration and reject transport errors",async()=>{
 const previousFetch=globalThis.fetch,old=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="test-public-key";
 const item={...valid,id:"home",provider:"YouTube",heading_vi:"Video Trixie",heading_en:null,updated_at:valid.expectedUpdatedAt};delete item.expectedUpdatedAt;
 globalThis.fetch=async(url,options)=>{assert(url.includes("is_visible=eq.true"));assert(!url.includes("updated_by"));assert.deepEqual(Object.keys(options.headers),["apikey"]);assert.deepEqual(options.next.tags,["video-settings"]);return Response.json([item]);};
 try{
  assert.deepEqual(await readPublicVideo(),item);
  globalThis.fetch=async()=>Response.json([]);assert.equal(await readPublicVideo(),null);
  globalThis.fetch=async()=>Response.json([{...item,is_visible:false}]);assert.equal(await readPublicVideo(),null);
  globalThis.fetch=async()=>Response.json([{...item,provider:"Vimeo"}]);assert.equal(await readPublicVideo(),null);
  globalThis.fetch=async()=>{throw Error("Offline");};await assert.rejects(readPublicVideo());
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;assert.equal((await readPublicVideo()).source_url,valid.source_url);
 }finally{globalThis.fetch=previousFetch;for(const [key,value]of[["NEXT_PUBLIC_SUPABASE_URL",old],["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",oldKey]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
