-- One-time transition from the previous draft-table schema. Run via SQL Editor.
BEGIN;
LOCK TABLE public.events, public.articles, public.content_drafts IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.content_drafts) THEN
  RAISE EXCEPTION 'Existing drafts must be resolved before applying this transition';
 END IF;
END $$;
ALTER TABLE public.events ADD COLUMN status text DEFAULT 'ready' NOT NULL CHECK (status IN ('draft','ready')),
 ALTER COLUMN title_vi SET DEFAULT '', ALTER COLUMN performer_name SET DEFAULT '', ALTER COLUMN event_date DROP NOT NULL,
 DROP CONSTRAINT events_artist_not_blank, DROP CONSTRAINT events_cover_required, DROP CONSTRAINT events_title_not_blank;
ALTER TABLE public.articles ADD COLUMN status text DEFAULT 'ready' NOT NULL CHECK (status IN ('draft','ready')),
 ALTER COLUMN title_vi SET DEFAULT '', ALTER COLUMN slug DROP NOT NULL,
 ADD CONSTRAINT articles_ready_fields CHECK (status='draft' OR (btrim(title_vi)<>'' AND slug IS NOT NULL AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'));
ALTER TABLE public.events ADD CONSTRAINT events_artist_not_blank CHECK (status = 'draft' OR ((btrim(performer_name) <> ''::text)));
ALTER TABLE public.events ADD CONSTRAINT events_cover_required CHECK (status = 'draft' OR (((cover_asset_id IS NOT NULL) OR (NULLIF(btrim(cover_image_url), ''::text) IS NOT NULL))));
ALTER TABLE public.events ADD CONSTRAINT events_title_not_blank CHECK (status = 'draft' OR ((btrim(title_vi) <> ''::text)));
ALTER TABLE public.events ADD CONSTRAINT events_ready_date CHECK (status = 'draft' OR event_date IS NOT NULL);
ALTER POLICY events_public_read ON public.events USING (status='ready' AND is_active AND NOT is_deleted);
ALTER POLICY articles_public_read ON public.articles USING (status='ready' AND published_at IS NOT NULL AND published_at<=now());
DROP VIEW public.admin_event_summaries, public.admin_article_summaries;
DROP VIEW public.admin_content_entries;
DROP FUNCTION public.save_content_draft(uuid,text,jsonb,timestamptz,uuid), public.delete_content_draft(uuid,timestamptz,uuid), public.commit_content(text,uuid,jsonb,timestamptz,uuid,uuid);
CREATE OR REPLACE FUNCTION private.validate_reservation_lifecycle() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare show_row public.events%rowtype; validate_visit boolean;begin
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.reference is distinct from old.reference or new.idempotency_key is distinct from old.idempotency_key or new.created_at is distinct from old.created_at then
   raise check_violation using message='reservation_identifiers_immutable';end if;
  if new.status is distinct from old.status and not (
   (old.status='pending' and new.status in ('confirmed','declined','cancelled','unreachable')) or
   (old.status='confirmed' and new.status='cancelled') or
   (old.status in ('cancelled','declined','unreachable') and new.status='pending')
  )then raise check_violation using message='reservation_transition_invalid';end if;
  validate_visit:=new.event_id is distinct from old.event_id or new.visit_date is distinct from old.visit_date or new.visit_time is distinct from old.visit_time or (new.status='pending' and old.status<>'pending');
 else
  if new.status not in ('pending','confirmed')then raise check_violation using message='reservation_initial_status_invalid';end if;
  validate_visit:=true;
 end if;
 if validate_visit then
  if (new.visit_date+new.visit_time) at time zone 'Asia/Ho_Chi_Minh'<=clock_timestamp() then raise check_violation using message='reservation_visit_past';end if;
  if new.event_id is not null then
   select * into show_row from public.events where id=new.event_id for share;
   if not found or show_row.status <> 'ready' or not show_row.is_active or show_row.is_deleted or show_row.event_date<=clock_timestamp() or new.visit_date<>(show_row.event_date at time zone 'Asia/Ho_Chi_Minh')::date then
    raise check_violation using message='reservation_event_unavailable';end if;
  end if;
 end if;
 new.updated_by:=auth.uid();return new;
end $$;

CREATE OR REPLACE FUNCTION private.queue_unused_media(candidates uuid[]) returns void language plpgsql security definer set search_path='' as $$
declare asset public.media_assets;
begin
 perform pg_advisory_xact_lock(741329106);
 for asset in select * from public.media_assets where id=any(candidates) for update loop
 if not exists(select 1 from public.events e where e.cover_asset_id=asset.id or strpos(to_jsonb(e)::text,asset.object_path)>0)
 and not exists(select 1 from public.articles a where strpos(to_jsonb(a)::text,asset.object_path)>0)
 and not exists(select 1 from public.seating_settings s where s.lower_asset_id=asset.id or s.upper_asset_id=asset.id or strpos(to_jsonb(s)::text,asset.object_path)>0)
 and not exists(select 1 from public.video_settings v where strpos(to_jsonb(v)::text,asset.object_path)>0)
 and not exists(select 1 from public.media_upload_claims c where c.asset_id=asset.id)
 then
 insert into public.media_deletion_jobs(provider,bucket_id,object_path)values(asset.provider,asset.bucket_id,asset.object_path)on conflict do nothing;
 delete from public.media_assets where id=asset.id;
 end if;
 end loop;
end $$;

CREATE OR REPLACE FUNCTION public.commit_content(p_kind text,p_id uuid,p_data jsonb,p_expected timestamptz,p_status text,p_session uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev public.events; ar public.articles; saved jsonb;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 if p_status not in ('draft','ready') or p_status is null then
  raise exception 'Invalid content status' using errcode='23514';
 end if;
 if p_kind='event' then
 if p_id is not null then
 select * into ev from public.events where id=p_id and updated_at=p_expected and (p_status='ready' or status='draft') for update;
 if not found then raise exception 'Event changed' using errcode='40001';end if;
 end if;
 ev:=jsonb_populate_record(ev,p_data);
 if p_id is null then
 insert into public.events(id,status,title_vi,title_en,performer_name,event_date,end_date,content_vi,content_en,cover_asset_id,cover_image_url,is_active,additional_fee,ticket_palette_override,source_id,source_url,created_by,updated_by)
 values(gen_random_uuid(),p_status,coalesce(ev.title_vi,''),ev.title_en,coalesce(ev.performer_name,''),ev.event_date,ev.end_date,coalesce(ev.content_vi,''),ev.content_en,ev.cover_asset_id,ev.cover_image_url,coalesce(ev.is_active,true),coalesce(ev.additional_fee,0),ev.ticket_palette_override,ev.source_id,ev.source_url,auth.uid(),auth.uid())returning to_jsonb(events.*)into saved;
 else
 update public.events set status=p_status,title_vi=coalesce(ev.title_vi,''),title_en=ev.title_en,performer_name=coalesce(ev.performer_name,''),event_date=ev.event_date,end_date=ev.end_date,content_vi=coalesce(ev.content_vi,''),content_en=ev.content_en,cover_asset_id=ev.cover_asset_id,cover_image_url=ev.cover_image_url,is_active=coalesce(ev.is_active,true),additional_fee=ev.additional_fee,ticket_palette_override=ev.ticket_palette_override,source_url=ev.source_url,updated_by=auth.uid()where id=p_id returning to_jsonb(events.*)into saved;
 end if;
 elsif p_kind='article' then
 if p_id is not null then select * into ar from public.articles where id=p_id and updated_at=p_expected and (p_status='ready' or status='draft') for update;if not found then raise exception 'Article changed' using errcode='40001';end if;end if;
 ar:=jsonb_populate_record(ar,p_data);
 if p_id is null then insert into public.articles(id,status,title_vi,title_en,slug,content_vi,content_en,thumbnail_url,published_at)values(gen_random_uuid(),p_status,coalesce(ar.title_vi,''),ar.title_en,nullif(ar.slug,''),coalesce(ar.content_vi,''),ar.content_en,ar.thumbnail_url,ar.published_at)returning to_jsonb(articles.*)into saved;
 else update public.articles set status=p_status,title_vi=coalesce(ar.title_vi,''),title_en=ar.title_en,slug=nullif(ar.slug,''),content_vi=coalesce(ar.content_vi,''),content_en=ar.content_en,thumbnail_url=ar.thumbnail_url,published_at=ar.published_at where id=p_id returning to_jsonb(articles.*)into saved;end if;
 else raise exception 'Invalid content kind' using errcode='23514';end if;
 if p_session is not null then perform public.release_media_session(p_session);end if;
 return saved || jsonb_build_object('is_draft',p_status='draft');
end $$;

CREATE OR REPLACE FUNCTION public.delete_content_draft(p_kind text,p_id uuid,p_expected timestamptz,p_session uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(741329106);
 if p_kind='event' then
  delete from public.events where id=p_id and status='draft' and updated_at=p_expected;
 elsif p_kind='article' then
  delete from public.articles where id=p_id and status='draft' and updated_at=p_expected;
 else raise check_violation using message='Invalid content kind'; end if;
 if not found then raise serialization_failure using message='Draft changed'; end if;
 if p_session is not null then perform public.release_media_session(p_session); end if;
end $$;

DROP TABLE public.content_drafts;
REVOKE ALL ON FUNCTION public.commit_content(text,uuid,jsonb,timestamptz,text,uuid), public.delete_content_draft(text,uuid,timestamptz,uuid) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.commit_content(text,uuid,jsonb,timestamptz,text,uuid), public.delete_content_draft(text,uuid,timestamptz,uuid) TO authenticated;
-- Admin summaries omit large rich-text bodies.
create view public.admin_event_summaries with(security_invoker=true) as
 select id,title_vi,title_en,performer_name,coalesce(event_date::text,'') event_date,end_date::text,cover_image_url,cover_asset_id::text,
 is_active,coalesce(additional_fee,0) additional_fee,is_deleted,updated_at,(status='draft') is_draft
 from public.events where not is_deleted;
create view public.admin_article_summaries with(security_invoker=true) as
 select id,title_vi,title_en,coalesce(slug,'') slug,thumbnail_url,published_at::text,updated_at,(status='draft') is_draft
 from public.articles;
revoke all on public.admin_event_summaries,public.admin_article_summaries from public,anon;
grant select on public.admin_event_summaries,public.admin_article_summaries to authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
