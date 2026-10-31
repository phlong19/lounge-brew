import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const require=createRequire(import.meta.url);
const {createClient}=require('@supabase/supabase-js');
const base=process.env.ADMIN_API_URL||'http://localhost:3001';
const fixture=JSON.parse(fs.readFileSync(new URL('../supabase/imports/phuong-linh-47320159.json',import.meta.url)));
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
const auth=await client.auth.signInWithPassword({email:process.env.ACCOUNT_EMAIL,password:process.env.ACCOUNT_PASSWORD});
if(auth.error)throw new Error('Import account could not sign in. Check local ACCOUNT_EMAIL / ACCOUNT_PASSWORD.');
const headers={Authorization:`Bearer ${auth.data.session.access_token}`};
async function api(route,init={}){const res=await fetch(base+route,{...init,headers:{...headers,...init.headers}});const data=await res.json();if(!res.ok)throw new Error(`${res.status}: ${data.error}`);return data;}
const existing=await client.from('events').select('id,title_vi,is_deleted').eq('source_id',fixture.event.source_id).maybeSingle();
if(existing.error)throw new Error('Cannot check existing imported event. Apply migrations first.');
if(existing.data){console.log(JSON.stringify({status:'already-imported',id:existing.data.id,title:existing.data.title_vi,isDeleted:existing.data.is_deleted}));process.exit(0);}
const images={};
for(const asset of fixture.assets){
 let bytes;
 const local=asset.localPath&&path.resolve(asset.localPath);
 if(local&&fs.existsSync(local))bytes=fs.readFileSync(local);
 else {
  const url=new URL(asset.sourceUrl);
  if(url.protocol!=='https:'||url.hostname!=='trixie.com.vn'||!url.pathname.startsWith('/media/'))throw new Error('Unexpected source image host.');
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'image/jpeg,image/png,image/webp'},redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`Image download failed (${response.status}): ${asset.key}. Put the original at ${asset.localPath} and retry.`);
  bytes=Buffer.from(await response.arrayBuffer());
 }
 if(bytes.length>10*1024*1024)throw new Error('Source image exceeds 10 MB.');
 const form=new FormData();form.set('file',new File([bytes],asset.filename,{type:'image/jpeg'}));form.set('sourceUrl',asset.sourceUrl);form.set('alt',asset.alt);
 const uploaded=await api('/api/admin/media',{method:'POST',body:form});images[asset.key]=uploaded;console.log('Image stored:',asset.key,uploaded.asset.id);
}
let content=fixture.contentTemplate;
for(const [key,asset]of Object.entries(images))content=content.replaceAll(`{{${key}}}`,asset.url);
const result=await api('/api/admin/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fixture.event,cover_image_url:images.poster.url,cover_asset_id:images.poster.asset.id,content_vi:content})});
console.log(JSON.stringify({status:'imported',id:result.item.id,publicId:result.item.public_id,title:result.item.title_vi,isActive:result.item.is_active,imageCount:Object.keys(images).length}));
