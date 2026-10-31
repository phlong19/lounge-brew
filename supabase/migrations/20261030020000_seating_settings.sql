
create table public.seating_settings (
 id text primary key default 'home' check (id = 'home'),
 lower_asset_id uuid references public.media_assets(id) on delete restrict,
 upper_asset_id uuid references public.media_assets(id) on delete restrict,
 is_visible boolean not null default false,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null,
 constraint visible_maps_required check (not is_visible or (lower_asset_id is not null and upper_asset_id is not null))
);
alter table public.seating_settings enable row level security;
create policy seating_public_read on public.seating_settings for select to anon using (is_visible);
create policy seating_staff_read on public.seating_settings for select to authenticated using (is_visible or (select private.has_staff_role(array['admin','editor'])));
create policy seating_staff_update on public.seating_settings for update to authenticated using ((select private.has_staff_role(array['admin','editor']))) with check ((select private.has_staff_role(array['admin','editor'])));
revoke all on public.seating_settings from anon,authenticated;
grant select on public.seating_settings to anon,authenticated;
grant update(lower_asset_id,upper_asset_id,is_visible,updated_at,updated_by) on public.seating_settings to authenticated;
grant all on public.seating_settings to service_role;
create function private.validate_seating_assets() returns trigger language plpgsql set search_path = '' as $$
begin
 if exists (select 1 from public.media_assets where id in (new.lower_asset_id,new.upper_asset_id) and bucket_id <> 'lounge-public') then
  raise exception 'Seating maps must be public images' using errcode = '23514';
 end if;
 return new;
end;
$$;
revoke all on function private.validate_seating_assets() from public;
create trigger seating_validate before insert or update on public.seating_settings for each row execute function private.validate_seating_assets();
create trigger seating_updated before update on public.seating_settings for each row execute function public.set_updated_at();
create trigger seating_audit after insert or update or delete on public.seating_settings for each row execute function private.audit_content_change();
insert into public.seating_settings(id) values ('home');
