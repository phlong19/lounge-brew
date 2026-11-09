-- Permanent event deletion with durable, private storage-cleanup jobs.
create table public.media_deletion_jobs (
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in ('r2','supabase')),
 bucket_id text not null,
 object_path text not null,
 created_at timestamptz not null default now(),
 claim_token uuid,
 lease_until timestamptz,
 unique(provider,bucket_id,object_path)
);
alter table public.media_deletion_jobs enable row level security;
revoke all on public.media_deletion_jobs from public,anon,authenticated;
grant all on public.media_deletion_jobs to service_role;

-- A content-addressed path must not be resurrected while its deletion is pending.
create function private.guard_media_pending_deletion() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.media_deletion_jobs j where j.provider=new.provider and j.bucket_id=new.bucket_id and j.object_path=new.object_path) then
  raise exception 'Media cleanup pending. Retry upload shortly.' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function private.guard_media_pending_deletion() from public;
create trigger media_pending_deletion before insert or update on public.media_assets for each row execute function private.guard_media_pending_deletion();

create function public.delete_event_permanently(p_event_id uuid,p_expected_updated_at timestamptz)
returns text language plpgsql security definer set search_path='' as $$
declare old_event public.events; asset public.media_assets;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege; end if;
 -- Serialize live references and media claims until the cleanup jobs are committed.
 lock table public.events,public.articles,public.seating_settings,public.video_settings,public.media_assets in share row exclusive mode;
 select * into old_event from public.events where id=p_event_id for update;
 if not found then raise exception 'Event not found' using errcode='P0002'; end if;
 if old_event.updated_at is distinct from p_expected_updated_at then raise exception 'Event changed' using errcode='40001'; end if;
 if exists(select 1 from public.reservations where event_id=p_event_id) then raise exception 'Event has reservations' using errcode='23503'; end if;
 delete from public.events where id=p_event_id;
 for asset in select m.* from public.media_assets m
 where m.id=old_event.cover_asset_id or strpos(to_jsonb(old_event)::text,m.object_path)>0
 loop
  -- Article images can be reused through URLs without a foreign key.
  if not exists(select 1 from public.events e where e.cover_asset_id=asset.id or strpos(to_jsonb(e)::text,asset.object_path)>0)
   and not exists(select 1 from public.articles a where strpos(to_jsonb(a)::text,asset.object_path)>0)
   and not exists(select 1 from public.seating_settings s where s.lower_asset_id=asset.id or s.upper_asset_id=asset.id or strpos(to_jsonb(s)::text,asset.object_path)>0)
   and not exists(select 1 from public.video_settings v where strpos(to_jsonb(v)::text,asset.object_path)>0)
  then
   insert into public.media_deletion_jobs(provider,bucket_id,object_path)values(asset.provider,asset.bucket_id,asset.object_path)on conflict do nothing;
   delete from public.media_assets where id=asset.id;
  end if;
 end loop;
 return old_event.public_id;
end $$;
revoke all on function public.delete_event_permanently(uuid,timestamptz) from public,anon;
grant execute on function public.delete_event_permanently(uuid,timestamptz) to authenticated;

create function public.claim_media_deletion_jobs(p_token uuid)
returns setof public.media_deletion_jobs language sql security definer set search_path='' as $$
 update public.media_deletion_jobs set claim_token=p_token,lease_until=now()+interval '10 minutes'
 where id in(select id from public.media_deletion_jobs where lease_until is null or lease_until<now() order by created_at limit 20 for update skip locked)
 returning *;
$$;
revoke all on function public.claim_media_deletion_jobs(uuid) from public,anon,authenticated;
grant execute on function public.claim_media_deletion_jobs(uuid) to service_role;

CREATE OR REPLACE FUNCTION private.audit_application_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare before_row jsonb; after_row jsonb; old_snapshot jsonb; new_snapshot jsonb; fields text[]; entity text;
begin
 before_row:=case when tg_op='INSERT' then null else to_jsonb(old) end;
 after_row:=case when tg_op='DELETE' then null else to_jsonb(new) end;
 entity:=coalesce(after_row->>'id',after_row->>'user_id',before_row->>'id',before_row->>'user_id');
 select coalesce(array_agg(key order by key),array[]::text[]) into fields
 from (select key from jsonb_object_keys(coalesce(before_row,'{}'::jsonb)||coalesce(after_row,'{}'::jsonb)) as keys(key)
 where key not in ('created_at','updated_at','updated_by') and before_row->key is distinct from after_row->key) changed;
 if tg_op='UPDATE' and cardinality(fields)=0 then return new; end if;
 old_snapshot:=before_row;new_snapshot:=after_row;
 if tg_table_name='reservations' then
  -- Contact details stay in reservations; do not duplicate them in history snapshots.
  select jsonb_object_agg(key,value) into old_snapshot from jsonb_each(coalesce(before_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
  select jsonb_object_agg(key,value) into new_snapshot from jsonb_each(coalesce(after_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
 end if;
 if tg_table_name='events' and tg_op='DELETE' then
  old_snapshot:=jsonb_build_object('id',old.id,'title_vi',old.title_vi,'event_date',old.event_date);
 end if;
 insert into public.audit_log(table_name,record_id,operation,actor_id,old_data,new_data,action,actor_type,changed_fields)
 values(tg_table_name,entity,tg_op,auth.uid(),old_snapshot,new_snapshot,
 tg_table_name||'.'||case when tg_op='UPDATE' and tg_table_name='reservations' and before_row->'status' is distinct from after_row->'status' then 'status_changed' else lower(tg_op) end,
 case when auth.uid() is not null then 'staff' when tg_op='INSERT' and tg_table_name='reservations' and after_row->>'source'='website' then 'guest' else 'system' end,fields);
 if tg_op='DELETE' then return old; end if;return new;
end $$;

