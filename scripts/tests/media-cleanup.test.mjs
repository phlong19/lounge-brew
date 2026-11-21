import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
const moduleUrl=code=>'data:text/javascript,'+encodeURIComponent(code);
registerHooks({resolve(s,c,n){
 if(s==='server-only')return {url:moduleUrl('export{}'),shortCircuit:true};
 if(s==='@/lib/supabase/admin')return {url:moduleUrl('export function createSupabaseAdminClient(){return globalThis.cleanupFixture.admin}'),shortCircuit:true};
 if(s==='@/lib/server/r2')return {url:moduleUrl('export function r2Config(){return {bucket:"editorial",client:{send:async command=>{globalThis.cleanupFixture.removed.push(command.input);if(globalThis.cleanupFixture.fail)throw new Error("offline")}}}}'),shortCircuit:true};
 if(s==='@aws-sdk/client-s3')return {url:moduleUrl('export class DeleteObjectCommand{constructor(input){this.input=input}}'),shortCircuit:true};
 return n(s.startsWith('@/')?pathToFileURL(`${process.cwd()}/src/${s.slice(2)}.ts`).href:s,c);
}});
const {drainMediaDeletionJobs}=await import('../../src/lib/server/media-cleanup.ts');
function fixture(jobs,fail=false){
 const f={removed:[],completed:[],released:[],fail};
 f.admin={rpc:async(name,args)=>{if(name==='expire_abandoned_media_claims')return {data:0,error:null};assert.equal(name,'claim_media_deletion_jobs');assert(args.p_token);return {data:jobs,error:null}},from:()=>({select:async()=>({count:fail?jobs.length:0}),delete:()=>chain(f.completed),update:()=>chain(f.released)})};
 function chain(target){const filters={};return {eq(key,value){filters[key]=value;return this},then(done){target.push(filters);return Promise.resolve({error:null}).then(done)}};}
 globalThis.cleanupFixture=f;return f;
}
test('owned R2 cleanup acknowledges only after deletion, with the claimed job token',async()=>{
 const f=fixture([{id:'job',provider:'r2',bucket_id:'editorial',object_path:'events/hash.jpg'}]);assert.equal(await drainMediaDeletionJobs(),0);
 assert.deepEqual(f.removed,[{Bucket:'editorial',Key:'events/hash.jpg'}]);assert.equal(f.completed[0].id,'job');assert(f.completed[0].claim_token);assert.equal(f.released.length,0);
});
test('storage failure keeps the durable job and releases its lease for retry',async()=>{
 const f=fixture([{id:'job',provider:'r2',bucket_id:'editorial',object_path:'events/hash.jpg'}],true);assert.equal(await drainMediaDeletionJobs(),1);assert.equal(f.completed.length,0);assert.equal(f.released[0].id,'job');
});
test('unexpected buckets and traversal paths cannot delete an object',async()=>{
 const f=fixture([{id:'other',provider:'r2',bucket_id:'unowned',object_path:'events/hash.jpg'},{id:'path',provider:'r2',bucket_id:'editorial',object_path:'../other.jpg'}]);assert.equal(await drainMediaDeletionJobs(),2);assert.equal(f.removed.length,0);assert.equal(f.completed.length,0);
});
