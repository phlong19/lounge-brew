-- Caller wraps this fixture-only contract in BEGIN ... ROLLBACK.
insert into public.media_assets(id,bucket_id,object_path,original_filename,mime_type,size_bytes,width,height)
values ('70000000-0000-4000-8000-000000000001','lounge-public','tests/lower.jpg','lower.jpg','image/jpeg',100,10,10),
 ('70000000-0000-4000-8000-000000000002','lounge-public','tests/upper.jpg','upper.jpg','image/jpeg',100,10,10);
update public.seating_settings set lower_asset_id='70000000-0000-4000-8000-000000000001',upper_asset_id='70000000-0000-4000-8000-000000000002',is_visible=true where id='home';

do $$ begin
 if (select count(*) from public.seating_settings where id='home') <> 1 then raise exception 'Missing singleton'; end if;
 begin
  update public.seating_settings set is_visible=true,lower_asset_id=null where id='home';
  raise exception 'Missing image accepted';
 exception when check_violation then null; end;
end $$;
set local role anon;
do $$ begin
 if not exists(select 1 from public.seating_settings where id='home') then raise exception 'Visible maps unavailable'; end if;
 begin
  update public.seating_settings set is_visible=false where id='home';
  raise exception 'Anonymous write accepted';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare changed int; begin
 update public.seating_settings set is_visible=false where id='home';
 get diagnostics changed = row_count;
 if changed <> 0 then raise exception 'Ordinary user edited settings'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
update public.seating_settings set is_visible=false where id='home';
set local role anon;
do $$ begin
 if exists(select 1 from public.seating_settings) then raise exception 'Hidden maps exposed'; end if;
end $$;
reset role;
