process.loadEnvFile('.env.local');
const query=`begin;
do $$
declare uid uuid; cover uuid:=gen_random_uuid(); body uuid:=gen_random_uuid(); shared uuid:=gen_random_uuid(); e1 uuid:=gen_random_uuid(); e2 uuid:=gen_random_uuid(); e3 uuid:=gen_random_uuid(); stamp timestamptz; claims jsonb; count_jobs integer;
begin
 perform set_config('request.jwt.claims','{}',true);
 begin perform public.delete_event_permanently(e1,now());raise exception 'Unauthorized deletion allowed';exception when insufficient_privilege then null;end;
 select user_id into uid from public.staff_members where role='admin' and is_active limit 1;
 if uid is null then raise exception 'No admin test actor';end if;
 claims:=jsonb_build_object('sub',uid,'role','authenticated','iat',extract(epoch from now())::bigint);
 perform set_config('request.jwt.claims',claims::text,true);
 insert into public.media_assets(id,provider,bucket_id,object_path,original_filename,mime_type,size_bytes,width,height)values
 (cover,'supabase','lounge-public','purge-test/'||cover||'.jpg','fixture.jpg','image/jpeg',1,1,1),
 (body,'supabase','lounge-public','purge-test/'||body||'.jpg','fixture.jpg','image/jpeg',1,1,1),
 (shared,'supabase','lounge-public','purge-test/'||shared||'.jpg','fixture.jpg','image/jpeg',1,1,1);
 insert into public.events(id,title_vi,performer_name,event_date,cover_asset_id,cover_image_url,content_vi)values
 (e1,'Purge fixture','Fixture',now()+interval '1 day',cover,'https://example.invalid/purge-test/'||cover||'.jpg','<img src="https://example.invalid/purge-test/'||body||'.jpg"><img src="https://example.invalid/purge-test/'||shared||'.jpg">'),
 (e2,'Shared cover fixture','Fixture',now()+interval '1 day',cover,'https://example.invalid/purge-test/'||cover||'.jpg',''),
 (e3,'Booked fixture','Fixture',now()+interval '1 day',shared,'https://example.invalid/purge-test/'||shared||'.jpg','');
 insert into public.articles(title_vi,slug,content_vi)values('Shared body fixture','purge-test-'||shared,'<img src="https://example.invalid/purge-test/'||shared||'.jpg">');
 select updated_at into stamp from public.events where id=e1;
 begin perform public.delete_event_permanently(e1,stamp-interval '1 second');raise exception 'Stale delete allowed';exception when serialization_failure then null;end;
 perform public.delete_event_permanently(e1,stamp);
 if exists(select 1 from public.events where id=e1) then raise exception 'Event retained';end if;
 if not exists(select 1 from public.media_assets where id=cover)then raise exception 'Shared cover removed';end if;
 if not exists(select 1 from public.media_assets where id=shared)then raise exception 'Shared article image removed';end if;
 if exists(select 1 from public.media_assets where id=body)then raise exception 'Unshared body metadata retained';end if;
 if not exists(select 1 from public.media_deletion_jobs where object_path='purge-test/'||body||'.jpg')then raise exception 'Body cleanup not queued';end if;
 if not exists(select 1 from public.audit_log where record_id=e1::text and operation='DELETE' and actor_id=uid and not(old_data ? 'content_vi'))then raise exception 'Audit receipt invalid';end if;
 begin insert into public.media_assets(provider,bucket_id,object_path,original_filename,mime_type,size_bytes,width,height)values('supabase','lounge-public','purge-test/'||body||'.jpg','fixture.jpg','image/jpeg',1,1,1);raise exception 'Pending path resurrected';exception when check_violation then null;end;
 select updated_at into stamp from public.events where id=e2;perform public.delete_event_permanently(e2,stamp);
 if exists(select 1 from public.media_assets where id=cover)then raise exception 'Unused cover retained';end if;
 insert into public.reservations(idempotency_key,event_id,name,phone,visit_date,visit_time,guests,source)values(gen_random_uuid(),e3,'Fixture','0991234567',current_date+1,'20:15',2,'phone');
 select updated_at into stamp from public.events where id=e3;
 begin perform public.delete_event_permanently(e3,stamp);raise exception 'Booked event removed';exception when foreign_key_violation then null;end;
 if not exists(select 1 from public.events where id=e3)then raise exception 'Booked event lost';end if;
 perform public.claim_media_deletion_jobs(gen_random_uuid());
 select count(*)into count_jobs from public.claim_media_deletion_jobs(gen_random_uuid());
 if count_jobs<>0 then raise exception 'Concurrent jobs claimed twice';end if;
 if has_table_privilege('authenticated','public.media_deletion_jobs','SELECT') or has_function_privilege('authenticated','public.claim_media_deletion_jobs(uuid)','EXECUTE')then raise exception 'Queue access leaked';end if;
end $$;
rollback;`;
const result=await fetch('https://api.supabase.com/v1/projects/zcftrbvrfiypqtwhmxxj/database/query',{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_PERSONAL_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query})});
console.log('Rollback-only deletion contract checks:',result.status);if(!result.ok){console.log(await result.text());process.exitCode=1;}
