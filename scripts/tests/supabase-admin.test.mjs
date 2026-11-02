import {test} from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
registerHooks({resolve(specifier,context,next){if(specifier==="server-only")return {url:"data:text/javascript,export{}",shortCircuit:true};return next(specifier,context);}});
const {createSupabaseAdminClient}=await import("../../src/lib/supabase/admin.ts");
test("privileged server client requires a new secret key and never falls back to the legacy key",()=>{
 const old={url:process.env.NEXT_PUBLIC_SUPABASE_URL,secret:process.env.SUPABASE_SECRET_KEY,legacy:process.env.SUPABASE_SERVICE_ROLE_KEY};
 try{
  process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";delete process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY="legacy_test_key";assert.equal(createSupabaseAdminClient(),null);
  process.env.SUPABASE_SECRET_KEY="legacy_test_key";assert.equal(createSupabaseAdminClient(),null);
  process.env.SUPABASE_SECRET_KEY="sb_secret_backend_test_only";const client=createSupabaseAdminClient();assert(client);assert.equal(client.supabaseKey,"sb_secret_backend_test_only");assert.equal(client.auth.persistSession,false);assert.equal(client.auth.autoRefreshToken,false);
 }finally{for(const [key,value] of [["NEXT_PUBLIC_SUPABASE_URL",old.url],["SUPABASE_SECRET_KEY",old.secret],["SUPABASE_SERVICE_ROLE_KEY",old.legacy]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

test("Auth admin creation sends the new server key through the SDK",async()=>{
 const previousFetch=globalThis.fetch,oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.SUPABASE_SECRET_KEY;
 let called=false;
 globalThis.fetch=async(url,init)=>{
  called=true;assert.equal(String(url),"https://example.supabase.co/auth/v1/admin/users");assert.equal(init.method,"POST");
  assert.equal(new Headers(init.headers).get("apikey"),"sb_secret_backend_test_only");
  return Response.json({id:"20000000-0000-4000-8000-000000000001",email:"mock@example.invalid",aud:"authenticated",role:"authenticated",app_metadata:{},user_metadata:{},created_at:"2026-11-01T00:00:00Z"});
 };
 try{
  process.env.NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co";process.env.SUPABASE_SECRET_KEY="sb_secret_backend_test_only";
  const client=createSupabaseAdminClient();const result=await client.auth.admin.createUser({email:"mock@example.invalid",password:"StrongPass1!",email_confirm:true});
  assert(called);assert.equal(result.error,null);assert.equal(result.data.user.id,"20000000-0000-4000-8000-000000000001");
 }finally{globalThis.fetch=previousFetch;for(const [key,value]of[["NEXT_PUBLIC_SUPABASE_URL",oldUrl],["SUPABASE_SECRET_KEY",oldKey]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
