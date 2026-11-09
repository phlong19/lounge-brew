-- Private incomplete drafts and scoped upload ownership; public records retain strict constraints.
create table public.content_drafts(id uuid primary key default gen_random_uuid(),kind text not null check(kind in('event','article')),data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<=1200000),created_by uuid not null default auth.uid() references auth.users(id),updated_at timestamptz not null default now());
create table public.media_upload_claims(session_id uuid not null,asset_id uuid not null references public.media_assets(id) on delete restrict,created_by uuid not null default auth.uid() references auth.users(id),created_at timestamptz not null default now(),primary key(session_id,asset_id,created_by));
alter table public.content_drafts enable row level security;
alter table public.media_upload_claims enable row level security;
revoke all on public.content_drafts,public.media_upload_claims from public,anon,authenticated;
grant select on public.content_drafts to authenticated;
grant all on public.content_drafts,public.media_upload_claims to service_role;
create policy drafts_staff_read on public.content_drafts for select to authenticated using(private.has_staff_role(array['admin','editor']));

create function private.serialize_content_media() returns trigger language plpgsql set search_path='' as $$begin perform pg_advisory_xact_lock(741329106);return null;end $$;
revoke all on function private.serialize_content_media() from public;
create trigger serialize_events before insert or update or delete on public.events for each statement execute function private.serialize_content_media();
create trigger serialize_articles before insert or update or delete on public.articles for each statement execute function private.serialize_content_media();
create trigger serialize_seating before insert or update or delete on public.seating_settings for each statement execute function private.serialize_content_media();
create trigger serialize_drafts before insert or update or delete on public.content_drafts for each statement execute function private.serialize_content_media();
create trigger serialize_media before insert or update or delete on public.media_assets for each statement execute function private.serialize_content_media();
create trigger serialize_claims before insert or update or delete on public.media_upload_claims for each statement execute function private.serialize_content_media();

create function private.media_candidates(document jsonb) returns uuid[] language sql security definer set search_path='' as $$
 select coalesce(array_agg(m.id),array[]::uuid[]) from public.media_assets m where strpos(coalesce(document::text,''),m.object_path)>0 or strpos(coalesce(document::text,''),m.id::text)>0;
$$;
create function private.queue_unused_media(candidates uuid[]) returns void language plpgsql security definer set search_path='' as $$
declare asset public.media_assets;
begin
 perform pg_advisory_xact_lock(741329106);
 for asset in select * from public.media_assets where id=any(candidates) for update loop
 if not exists(select 1 from public.events e where e.cover_asset_id=asset.id or strpos(to_jsonb(e)::text,asset.object_path)>0)
 and not exists(select 1 from public.articles a where strpos(to_jsonb(a)::text,asset.object_path)>0)
 and not exists(select 1 from public.seating_settings s where s.lower_asset_id=asset.id or s.upper_asset_id=asset.id or strpos(to_jsonb(s)::text,asset.object_path)>0)
 and not exists(select 1 from public.video_settings v where strpos(to_jsonb(v)::text,asset.object_path)>0)
 and not exists(select 1 from public.content_drafts d where strpos(d.data::text,asset.object_path)>0 or strpos(d.data::text,asset.id::text)>0)
 and not exists(select 1 from public.media_upload_claims c where c.asset_id=asset.id)
 then
 insert into public.media_deletion_jobs(provider,bucket_id,object_path)values(asset.provider,asset.bucket_id,asset.object_path)on conflict do nothing;
 delete from public.media_assets where id=asset.id;
 end if;
 end loop;
end $$;
revoke all on function private.media_candidates(jsonb),private.queue_unused_media(uuid[]) from public;
create function private.cleanup_replaced_media() returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.queue_unused_media(private.media_candidates(to_jsonb(old)));return null;end $$;
revoke all on function private.cleanup_replaced_media() from public;
create trigger events_cleanup after update or delete on public.events for each row execute function private.cleanup_replaced_media();
create trigger articles_cleanup after update or delete on public.articles for each row execute function private.cleanup_replaced_media();
create trigger seating_cleanup after update on public.seating_settings for each row execute function private.cleanup_replaced_media();
create trigger drafts_cleanup after update or delete on public.content_drafts for each row execute function private.cleanup_replaced_media();

create function public.claim_media_upload(p_session uuid,p_asset uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 perform 1 from public.media_assets where id=p_asset for update;if not found then raise exception 'Media no longer exists' using errcode='23503';end if;
 insert into public.media_upload_claims(session_id,asset_id,created_by)values(p_session,p_asset,auth.uid())on conflict do nothing;
end $$;
create function public.release_media_session(p_session uuid) returns void language plpgsql security definer set search_path='' as $$
declare candidates uuid[];
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 select array_agg(asset_id) into candidates from public.media_upload_claims where session_id=p_session and created_by=auth.uid();
 delete from public.media_upload_claims where session_id=p_session and created_by=auth.uid();
 perform private.queue_unused_media(coalesce(candidates,array[]::uuid[]));
end $$;
create function public.save_content_draft(p_id uuid,p_kind text,p_data jsonb,p_expected timestamptz,p_session uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.content_drafts;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 if p_id is null then insert into public.content_drafts(kind,data)values(p_kind,p_data)returning * into saved;
 else update public.content_drafts set data=p_data,updated_at=clock_timestamp() where id=p_id and kind=p_kind and updated_at=p_expected returning * into saved;
 if not found then raise exception 'Draft changed' using errcode='40001';end if;end if;
 if p_session is not null then perform public.release_media_session(p_session);end if;
 return to_jsonb(saved);
end $$;
create function public.delete_content_draft(p_id uuid,p_expected timestamptz,p_session uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 delete from public.content_drafts where id=p_id and updated_at=p_expected;
 if not found then raise exception 'Draft changed' using errcode='40001';end if;
 if p_session is not null then perform public.release_media_session(p_session);end if;
end $$;

-- Canonical write + draft promotion + upload claim release are one DB transaction.
create function public.commit_content(p_kind text,p_id uuid,p_data jsonb,p_expected timestamptz,p_draft uuid,p_session uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev public.events; ar public.articles; saved jsonb;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 if p_draft is not null then
 perform 1 from public.content_drafts where id=p_draft and kind=p_kind and updated_at=p_expected for update;
 if not found then raise exception 'Draft changed' using errcode='40001';end if;
 end if;
 if p_kind='event' then
 if p_id is not null then
 select * into ev from public.events where id=p_id and updated_at=p_expected for update;
 if not found then raise exception 'Event changed' using errcode='40001';end if;
 end if;
 ev:=jsonb_populate_record(ev,p_data);
 if p_id is null then
 insert into public.events(id,title_vi,title_en,performer_name,event_date,end_date,content_vi,content_en,cover_asset_id,cover_image_url,is_active,additional_fee,ticket_palette_override,source_id,source_url,created_by,updated_by)
 values(coalesce(p_draft,gen_random_uuid()),ev.title_vi,ev.title_en,ev.performer_name,ev.event_date,ev.end_date,coalesce(ev.content_vi,''),ev.content_en,ev.cover_asset_id,ev.cover_image_url,coalesce(ev.is_active,true),coalesce(ev.additional_fee,0),ev.ticket_palette_override,ev.source_id,ev.source_url,auth.uid(),auth.uid())returning to_jsonb(events.*)into saved;
 else
 update public.events set title_vi=ev.title_vi,title_en=ev.title_en,performer_name=ev.performer_name,event_date=ev.event_date,end_date=ev.end_date,content_vi=ev.content_vi,content_en=ev.content_en,cover_asset_id=ev.cover_asset_id,cover_image_url=ev.cover_image_url,is_active=ev.is_active,additional_fee=ev.additional_fee,ticket_palette_override=ev.ticket_palette_override,source_url=ev.source_url,updated_by=auth.uid()where id=p_id returning to_jsonb(events.*)into saved;
 end if;
 elsif p_kind='article' then
 if p_id is not null then select * into ar from public.articles where id=p_id and updated_at=p_expected for update;if not found then raise exception 'Article changed' using errcode='40001';end if;end if;
 ar:=jsonb_populate_record(ar,p_data);
 if p_id is null then insert into public.articles(id,title_vi,title_en,slug,content_vi,content_en,thumbnail_url,published_at)values(coalesce(p_draft,gen_random_uuid()),ar.title_vi,ar.title_en,ar.slug,coalesce(ar.content_vi,''),ar.content_en,ar.thumbnail_url,ar.published_at)returning to_jsonb(articles.*)into saved;
 else update public.articles set title_vi=ar.title_vi,title_en=ar.title_en,slug=ar.slug,content_vi=ar.content_vi,content_en=ar.content_en,thumbnail_url=ar.thumbnail_url,published_at=ar.published_at where id=p_id returning to_jsonb(articles.*)into saved;end if;
 else raise exception 'Invalid content kind' using errcode='23514';end if;
 if p_draft is not null then delete from public.content_drafts where id=p_draft;end if;
 if p_session is not null then perform public.release_media_session(p_session);end if;
 return saved;
end $$;
revoke all on function public.claim_media_upload(uuid,uuid),public.release_media_session(uuid),public.save_content_draft(uuid,text,jsonb,timestamptz,uuid),public.delete_content_draft(uuid,timestamptz,uuid),public.commit_content(text,uuid,jsonb,timestamptz,uuid,uuid) from public,anon;
grant execute on function public.claim_media_upload(uuid,uuid),public.release_media_session(uuid),public.save_content_draft(uuid,text,jsonb,timestamptz,uuid),public.delete_content_draft(uuid,timestamptz,uuid),public.commit_content(text,uuid,jsonb,timestamptz,uuid,uuid) to authenticated;

-- Admin-only combined list keeps incomplete drafts out of public tables and queries.
create view public.admin_content_entries with(security_invoker=true) as
 select 'event'::text kind,e.id,to_jsonb(e) data,e.updated_at,false is_draft from public.events e where not e.is_deleted
 union all select 'article',a.id,to_jsonb(a),a.updated_at,false from public.articles a
 union all select d.kind,d.id,d.data,d.updated_at,true from public.content_drafts d;
revoke all on public.admin_content_entries from public,anon;
grant select on public.admin_content_entries to authenticated;

create or replace function public.delete_event_permanently(p_event_id uuid,p_expected_updated_at timestamptz) returns text language plpgsql security definer set search_path='' as $$
declare old_event public.events;
begin
 if not private.has_staff_role(array['admin','editor'])then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 select * into old_event from public.events where id=p_event_id for update;
 if not found then raise exception 'Event not found'using errcode='P0002';end if;
 if old_event.updated_at is distinct from p_expected_updated_at then raise exception 'Event changed'using errcode='40001';end if;
 if exists(select 1 from public.reservations where event_id=p_event_id)then raise exception 'Event has reservations'using errcode='23503';end if;
 delete from public.events where id=p_event_id;
 return old_event.public_id;
end $$;
