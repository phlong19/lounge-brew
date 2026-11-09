-- Cache analysis by immutable cover bytes; public cards read the event key directly.
alter table public.media_assets add column ticket_palette_key text,
 add column ticket_palette_version integer not null default 0 check(ticket_palette_version>=0),
 add column ticket_palette_hash text check(ticket_palette_hash is null or ticket_palette_hash ~ '^[0-9a-f]{64}$');
alter table public.events add column ticket_palette_key text;
create or replace function private.sync_event_ticket_palette() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' or new.cover_asset_id is distinct from old.cover_asset_id or new.cover_image_url is distinct from old.cover_image_url then
  new.ticket_palette_key := (select ticket_palette_key from public.media_assets where id=new.cover_asset_id);
 end if;
 return new;
end; $$;
revoke all on function private.sync_event_ticket_palette() from public,anon,authenticated;
create trigger events_ticket_palette before insert or update on public.events
for each row execute function private.sync_event_ticket_palette();
comment on column public.events.ticket_palette_key is 'Server-generated static Tailwind palette key from the current cover; no public image analysis required.';
