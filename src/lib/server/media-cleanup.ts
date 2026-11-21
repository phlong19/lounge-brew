import "server-only";
import {randomUUID} from "node:crypto";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { r2Config } from "@/lib/server/r2";

/** Durable jobs remain available if storage is temporarily unavailable. Never delete external URLs. */
export async function drainMediaDeletionJobs() {
 const admin=createSupabaseAdminClient();
 if(!admin)throw new Error("Media cleanup is not configured");
 const expired=await admin.rpc("expire_abandoned_media_claims");
 if(expired.error)throw new Error("Cannot expire abandoned uploads");
 const token=randomUUID();
 const jobs=await admin.rpc("claim_media_deletion_jobs",{p_token:token});
 if(jobs.error)throw new Error("Cannot read media cleanup jobs");
 let pending=0;
 await Promise.all((jobs.data??[]).map(async job=>{
  try {
   if(!job.object_path||job.object_path.startsWith("/")||job.object_path.split("/").includes(".."))throw new Error("Invalid media path");
   if(job.provider==="r2") {
    const config=r2Config();
    if(config.bucket!==job.bucket_id)throw new Error("Unexpected media bucket");
    await config.client.send(new DeleteObjectCommand({Bucket:job.bucket_id,Key:job.object_path}),{abortSignal:AbortSignal.timeout(15000)});
   } else if(job.provider==="supabase" && ["lounge-public","lounge-drafts"].includes(job.bucket_id)) {
    const result=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${encodeURIComponent(job.bucket_id)}`,{method:"DELETE",headers:{apikey:process.env.SUPABASE_SECRET_KEY!,Authorization:`Bearer ${process.env.SUPABASE_SECRET_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({prefixes:[job.object_path]}),signal:AbortSignal.timeout(15000)});
    if(!result.ok)throw new Error("Storage cleanup failed");
   } else throw new Error("Unexpected media provider");
   const removed=await admin.from("media_deletion_jobs").delete().eq("id",job.id).eq("claim_token",token);
   if(removed.error)throw new Error("Cannot complete media cleanup job");
  } catch { pending++; await admin.from("media_deletion_jobs").update({claim_token:null,lease_until:null}).eq("id",job.id).eq("claim_token",token); }
 }));
 const remaining=await admin.from("media_deletion_jobs").select("id",{count:"exact",head:true});
 return Math.max(pending,remaining.error?1:remaining.count??0);
}
