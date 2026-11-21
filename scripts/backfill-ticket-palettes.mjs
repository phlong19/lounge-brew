import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createClient} from '@supabase/supabase-js';
import {S3Client,GetObjectCommand} from '@aws-sdk/client-s3';
process.loadEnvFile('.env.local');
registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('@/')?pathToFileURL(process.cwd()+'/src/'+specifier.slice(2)+'.ts').href:specifier,context);}});
const {extractTicketPalette}=await import('../src/lib/media/extract-ticket-palette.ts');
const {isTrustedMediaSource}=await import('../src/lib/config/image-patterns.ts');
const apply=process.argv.includes('--apply');
const base=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
if(base!=='https://zcftrbvrfiypqtwhmxxj.supabase.co'||!key?.startsWith('sb_secret_'))throw Error('Unexpected import project or missing server key');
const db=createClient(base,key,{auth:{persistSession:false,autoRefreshToken:false}});
const covers=await db.from('events').select('id,public_id,performer_name,cover_asset_id,cover_image_url,ticket_palette_key').eq('is_deleted',false).eq('is_active',true).gte('event_date',new Date().toISOString()).order('event_date');
if(covers.error)throw Error('Cannot read covers; apply the ticket palette migration first');
async function imageBytes(url){
 if(!isTrustedMediaSource(url))throw Error('Untrusted stored image');
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(25000)});
 if(!response.ok||Number(response.headers.get('content-length'))>10485760)throw Error('Cannot read stored cover');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>10485760){await reader.cancel();throw Error('Cover exceeds size limit');}chunks.push(part.value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
// Verify actual authenticated R2 reads against public delivery, not just env presence.
const asset=await db.from('media_assets').select('bucket_id,object_path').eq('provider','r2').limit(1).single();
if(asset.error)throw Error('No R2 asset available to verify');
if(asset.data.bucket_id!==process.env.R2_BUCKET_NAME)throw Error('R2 bucket mismatch');
const r2=new S3Client({region:'auto',endpoint:`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:process.env.R2_ACCESS_KEY_ID,secretAccessKey:process.env.R2_SECRET_ACCESS_KEY},maxAttempts:2});
const object=await r2.send(new GetObjectCommand({Bucket:asset.data.bucket_id,Key:asset.data.object_path}));
if(object.ContentLength>10485760)throw Error('R2 verification object too large');
const authenticated=Buffer.from(await object.Body.transformToByteArray());
const delivered=await imageBytes(process.env.R2_PUBLIC_BASE_URL.replace(/\/$/,'')+'/'+asset.data.object_path.split('/').map(encodeURIComponent).join('/'));
if(createHash('sha256').update(authenticated).digest('hex')!==createHash('sha256').update(delivered).digest('hex'))throw Error('R2 delivery checksum mismatch');
console.log('R2 authenticated read and public delivery: verified');
const memo=new Map(),results=[];
for(const event of covers.data){
 if(!event.cover_image_url)continue;
 let palette=memo.get(event.cover_image_url);
 if(!palette){palette=await extractTicketPalette(await imageBytes(event.cover_image_url));memo.set(event.cover_image_url,palette);}
 if(apply){
  if(event.cover_asset_id){const saved=await db.from('media_assets').update({ticket_palette_key:palette.key,ticket_palette_version:palette.version,ticket_palette_hash:palette.hash}).eq('id',event.cover_asset_id);if(saved.error)throw Error('Cannot save palette metadata');}
  // Optimistic cover match avoids assigning the old palette if an editor replaces it.
  const saved=await db.from('events').update({ticket_palette_key:palette.key}).eq('id',event.id).eq('cover_image_url',event.cover_image_url).select('id').maybeSingle();
  if(saved.error||!saved.data)throw Error('Cover changed or palette save failed; retry safely');
 }
 results.push({id:event.public_id,artist:event.performer_name,palette:palette.key,hash:palette.hash,version:palette.version});
 console.log(event.public_id,event.performer_name,'=>',palette.key);
}
if(apply)fs.writeFileSync('supabase/imports/ticket-palettes-2026-11-09.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify({applied:apply,events:results.length,uniqueCovers:memo.size}));
