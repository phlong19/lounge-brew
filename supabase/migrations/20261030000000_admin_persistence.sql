-- Complete persistence contract for the current event/video admin and booking form.
-- Forward migration: retain existing menu, article and legacy event columns/data.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = pg_catalog.now(); return new; end;
$$;

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor','booking')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger staff_members_updated before update on public.staff_members for each row execute function public.set_updated_at();
alter table public.staff_members enable row level security;

create function private.has_staff_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff_members s where s.user_id = (select auth.uid()) and s.is_active and s.role = any(allowed_roles));
$$;
revoke all on function private.has_staff_role(text[]) from public;
grant execute on function private.has_staff_role(text[]) to authenticated;
create policy staff_read_self_or_admin on public.staff_members for select to authenticated
  using (user_id = (select auth.uid()) or (select private.has_staff_role(array['admin'])));
create policy staff_admin_manage on public.staff_members for all to authenticated
  using ((select private.has_staff_role(array['admin']))) with check ((select private.has_staff_role(array['admin'])));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('lounge-drafts','lounge-drafts',false,10485760,array['image/jpeg','image/png','image/webp']),
 ('lounge-public','lounge-public',true,10485760,array['image/jpeg','image/png','image/webp']);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id) on delete restrict,
  object_path text not null check (btrim(object_path) <> '' and object_path !~ '(^/|(^|/)\.\.(/|$))'),
  original_filename text not null check (btrim(original_filename) <> ''),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt_vi text not null default '',
  alt_en text,
  source_url text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id,object_path),
  constraint media_pixel_limit check (width::bigint * height::bigint <= 40000000),
  constraint media_owned_buckets check (bucket_id in ('lounge-drafts','lounge-public'))
);
create trigger media_assets_updated before update on public.media_assets for each row execute function public.set_updated_at();
alter table public.media_assets enable row level security;
create policy media_public_metadata on public.media_assets for select to anon,authenticated using (bucket_id='lounge-public');
create policy media_staff_manage on public.media_assets for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));

alter table public.events
 add column source_id text unique,
 add column public_id text generated always as (coalesce(source_id,id::text)) stored,
 add column source_url text,
 add column end_date timestamptz,
 add column content_vi text not null default '',
 add column content_en text,
 add column additional_fee bigint,
 add column cover_asset_id uuid references public.media_assets(id) on delete restrict,
 add column created_by uuid default auth.uid() references auth.users(id) on delete set null,
 add column updated_by uuid references auth.users(id) on delete set null,
 add constraint events_public_id_unique unique(public_id),
 add constraint events_source_id_not_blank check (source_id is null or btrim(source_id) <> ''),
 add constraint events_title_not_blank check (btrim(title_vi) <> ''),
 add constraint events_artist_not_blank check (btrim(performer_name) <> ''),
 add constraint events_valid_times check (isfinite(event_date) and (end_date is null or (isfinite(end_date) and end_date >= event_date))),
 add constraint events_additional_fee_valid check (additional_fee is null or additional_fee between 0 and 9007199254740991),
 add constraint events_source_https check (source_url is null or source_url ~ '^https://'),
 add constraint events_cover_required check (cover_asset_id is not null or nullif(btrim(cover_image_url),'') is not null) not valid,
 add constraint events_cover_url_safe check (cover_image_url is null or cover_image_url ~ '^(https://|/trixie/)') not valid;
-- NOT VALID preserves legacy rows; all new writes must supply a poster.
alter table public.events alter column public_id set not null;
do $$ begin
 if not exists(select 1 from public.events where cover_asset_id is null and nullif(btrim(cover_image_url),'') is null) then alter table public.events validate constraint events_cover_required; end if;
 if not exists(select 1 from public.events where cover_image_url is not null and cover_image_url !~ '^(https://|/trixie/)') then alter table public.events validate constraint events_cover_url_safe; end if;
end $$;
create index events_visible_upcoming_idx on public.events(event_date) where is_active;
create index events_cover_asset_idx on public.events(cover_asset_id);

create function private.validate_event_cover()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.is_active and new.cover_asset_id is not null and not exists (
   select 1 from public.media_assets m where m.id=new.cover_asset_id and m.bucket_id='lounge-public'
 ) then raise check_violation using message='Publish the poster before showing the event.'; end if;
 return new;
end; $$;
revoke all on function private.validate_event_cover() from public;
create trigger events_validate_cover before insert or update on public.events for each row execute function private.validate_event_cover();

create table public.video_settings (
  id text primary key default 'home' check (id='home'),
  source_url text not null check (source_url ~ '^https://[^/@]+/'),
  provider text not null check (provider in ('YouTube','Facebook','Vimeo','Video')),
  heading_vi text not null check (btrim(heading_vi) <> ''),
  heading_en text,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create trigger video_settings_updated before update on public.video_settings for each row execute function public.set_updated_at();
alter table public.video_settings enable row level security;
create policy video_public_read on public.video_settings for select to anon,authenticated using(is_visible);
create policy video_staff_manage on public.video_settings for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));

-- Remove the scaffold's broad "any signed-in user can write" rules.
drop policy categories_authenticated_manage on public.categories;
drop policy menu_items_authenticated_manage on public.menu_items;
drop policy events_authenticated_manage on public.events;
drop policy articles_authenticated_manage on public.articles;
create policy categories_staff_manage on public.categories for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));
create policy menu_items_staff_manage on public.menu_items for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));
create policy events_staff_manage on public.events for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));
create policy articles_staff_manage on public.articles for all to authenticated
 using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));

create table public.reservations (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique default ('BR-' || replace(gen_random_uuid()::text,'-','')),
 idempotency_key uuid not null unique,
 event_id uuid references public.events(id) on delete restrict,
 name text not null check (char_length(btrim(name)) between 1 and 120),
 phone text not null check (phone ~ '^[+0-9 ().-]+$' and char_length(regexp_replace(phone,'[^0-9]','','g')) between 7 and 15),
 email text check (email is null or (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 visit_date date not null check (isfinite(visit_date)),
 visit_time time not null check (visit_time between time '07:00' and time '23:00'),
 venue_timezone text not null default 'Asia/Ho_Chi_Minh' check (venue_timezone='Asia/Ho_Chi_Minh'),
 guests integer not null check (guests > 0),
 notes text not null default '' check (char_length(notes) <= 1000),
 status text not null default 'new' check (status in ('new','contacted','confirmed','declined','cancelled')),
 assigned_to uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
create index reservations_event_id_idx on public.reservations(event_id);
create index reservations_assigned_to_idx on public.reservations(assigned_to);
create index reservations_queue_idx on public.reservations(status,created_at desc);
create trigger reservations_updated before update on public.reservations for each row execute function public.set_updated_at();
alter table public.reservations enable row level security;
create policy reservations_staff_read on public.reservations for select to authenticated using((select private.has_staff_role(array['admin','booking'])));
create policy reservations_staff_insert on public.reservations for insert to authenticated with check((select private.has_staff_role(array['admin','booking'])));
create policy reservations_staff_update on public.reservations for update to authenticated using((select private.has_staff_role(array['admin','booking']))) with check((select private.has_staff_role(array['admin','booking'])));

create table public.reservation_activity (
 id bigint generated always as identity primary key,
 reservation_id uuid not null references public.reservations(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 previous_status text,
 new_status text not null,
 created_at timestamptz not null default now()
);
alter table public.reservation_activity enable row level security;
create policy reservation_activity_staff_read on public.reservation_activity for select to authenticated using((select private.has_staff_role(array['admin','booking'])));
create function private.record_reservation_status()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' or new.status is distinct from old.status then
  insert into public.reservation_activity(reservation_id,actor_id,previous_status,new_status)
  values(new.id,auth.uid(),case when tg_op='INSERT' then null else old.status end,new.status);
 end if; return new;
end; $$;
revoke all on function private.record_reservation_status() from public;
create trigger reservations_activity after insert or update on public.reservations for each row execute function private.record_reservation_status();

create table public.content_audit_log (
 id bigint generated always as identity primary key,
 table_name text not null,
 record_id text not null,
 operation text not null check(operation in ('INSERT','UPDATE','DELETE')),
 actor_id uuid references auth.users(id) on delete set null,
 old_data jsonb,
 new_data jsonb,
 created_at timestamptz not null default now()
);
alter table public.content_audit_log enable row level security;
create policy audit_admin_read on public.content_audit_log for select to authenticated using((select private.has_staff_role(array['admin'])));
create function private.audit_content_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.content_audit_log(table_name,record_id,operation,actor_id,old_data,new_data)
 values(tg_table_name,case when tg_op='DELETE' then old.id::text else new.id::text end,tg_op,auth.uid(),case when tg_op='INSERT' then null else to_jsonb(old) end,case when tg_op='DELETE' then null else to_jsonb(new) end);
 if tg_op='DELETE' then return old; end if; return new;
end; $$;
revoke all on function private.audit_content_change() from public;
create trigger events_audit after insert or update or delete on public.events for each row execute function private.audit_content_change();
create trigger video_settings_audit after insert or update or delete on public.video_settings for each row execute function private.audit_content_change();

-- Staff can upload/list objects; public downloads use only the public bucket.
create policy lounge_media_staff_read on storage.objects for select to authenticated
 using(bucket_id in ('lounge-drafts','lounge-public') and (select private.has_staff_role(array['admin','editor'])));
create policy lounge_media_staff_insert on storage.objects for insert to authenticated
 with check(bucket_id in ('lounge-drafts','lounge-public') and (select private.has_staff_role(array['admin','editor'])));
create policy lounge_media_staff_update on storage.objects for update to authenticated
 using(bucket_id in ('lounge-drafts','lounge-public') and (select private.has_staff_role(array['admin','editor'])))
 with check(bucket_id in ('lounge-drafts','lounge-public') and (select private.has_staff_role(array['admin','editor'])));
create policy lounge_media_staff_delete on storage.objects for delete to authenticated
 using(bucket_id in ('lounge-drafts','lounge-public') and (select private.has_staff_role(array['admin','editor'])) and not exists (
  select 1 from public.events e join public.media_assets m on m.id=e.cover_asset_id where m.bucket_id=storage.objects.bucket_id and m.object_path=storage.objects.name
 ));

revoke all on public.staff_members, public.media_assets, public.video_settings, public.reservations, public.reservation_activity, public.content_audit_log from anon,authenticated;
grant select on public.categories,public.menu_items,public.events,public.articles,public.media_assets,public.video_settings to anon;
grant select,insert,update,delete on public.categories,public.menu_items,public.events,public.articles,public.staff_members,public.media_assets,public.video_settings to authenticated;
grant select,insert,update on public.reservations to authenticated;
grant select on public.reservation_activity,public.content_audit_log to authenticated;
grant all on public.staff_members,public.media_assets,public.video_settings,public.reservations,public.reservation_activity,public.content_audit_log to service_role;
grant usage,select on sequence public.reservation_activity_id_seq,public.content_audit_log_id_seq to service_role;

comment on column public.events.additional_fee is 'Unformatted integer VND; NULL means unspecified. UI additionalFee maps here.';
comment on column public.events.content_vi is 'Full event-page HTML, including safe rich-text colour marks; not a short description.';
comment on column public.events.public_id is 'Stable public lookup ID: imported source ID, otherwise UUID text. Preserve existing event URLs.';
comment on table public.video_settings is 'Homepage video URL/provider, VI/EN headings and visibility. Embed URL is derived, never trusted raw HTML.';
comment on table public.reservations is 'Private booking requests. An insert is receipt only; status new never promises a confirmed table.';
notify pgrst,'reload schema';
