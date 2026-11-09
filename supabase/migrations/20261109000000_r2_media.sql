-- Preserve all existing Supabase assets while allowing editorial R2 objects.
alter table public.media_assets add column provider text not null default 'supabase' check (provider in ('supabase','r2'));
alter table public.media_assets drop constraint media_assets_bucket_id_fkey;
alter table public.media_assets drop constraint media_owned_buckets;
alter table public.media_assets drop constraint media_assets_bucket_id_object_path_key;
alter table public.media_assets add constraint media_provider_bucket_path_unique unique(provider,bucket_id,object_path);
alter table public.media_assets add constraint media_provider_bucket check ((provider='supabase' and bucket_id in ('lounge-drafts','lounge-public')) or (provider='r2' and btrim(bucket_id)<>''));
-- Public pages use direct URLs; expose only public Supabase metadata as before.
create or replace function private.validate_event_cover()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.is_active and new.cover_asset_id is not null and not exists(select 1 from public.media_assets m where m.id=new.cover_asset_id and (m.provider='r2' or (m.provider='supabase' and m.bucket_id='lounge-public'))) then
 raise check_violation using message='Publish the poster before showing the event.'; end if;
 return new;
end; $$;
create or replace function private.validate_seating_assets() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.media_assets where id in(new.lower_asset_id,new.upper_asset_id) and (provider<>'supabase' or bucket_id<>'lounge-public')) then raise exception 'Seating maps must be public Supabase images' using errcode='23514'; end if;
 return new;
end; $$;

alter policy media_public_metadata on public.media_assets using (provider='supabase' and bucket_id='lounge-public');
