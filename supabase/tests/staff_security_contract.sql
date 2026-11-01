insert into auth.users(id,email) values
('40000000-0000-4000-8000-000000000001','staff-contract-admin@example.invalid'),
('40000000-0000-4000-8000-000000000002','staff-contract-editor@example.invalid');
insert into public.staff_members(user_id,display_name,role,is_active) values
('40000000-0000-4000-8000-000000000001','Contract admin','admin',true),
('40000000-0000-4000-8000-000000000002','Contract editor','editor',true);
insert into auth.sessions(id,user_id) values ('40000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claims',jsonb_build_object('sub','40000000-0000-4000-8000-000000000001','role','authenticated','iat',extract(epoch from now())::bigint)::text,true);
do $$ declare result jsonb; ended integer;begin
 result:=public.admin_staff_directory('staff-contract-editor','active',1);
 if jsonb_array_length(result->'items')<>1 or result->'items'->0->>'email'<>'staff-contract-editor@example.invalid' then raise exception 'Admin email search failed';end if;
 if exists(select 1 from jsonb_array_elements(public.admin_staff_directory('staff-contract','all',1)->'items') row where row->>'role'='admin') then raise exception 'Admin leaked into directory';end if;
 ended:=public.finish_staff_security_action('40000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000001','staff.password_changed');
 if ended<>1 or exists(select 1 from auth.sessions where user_id='40000000-0000-4000-8000-000000000002') then raise exception 'Sessions not ended';end if;
 if not exists(select 1 from public.audit_log where record_id='40000000-0000-4000-8000-000000000002' and action='staff.password_changed' and actor_id='40000000-0000-4000-8000-000000000001') then raise exception 'Security audit missing';end if;
 if has_function_privilege('authenticated','public.finish_staff_security_action(uuid,uuid,text)','execute') then raise exception 'Privileged session RPC exposed';end if;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims',jsonb_build_object('sub','40000000-0000-4000-8000-000000000002','role','authenticated','iat',0)::text,true);
do $$ begin
 if public.staff_access_allowed() then raise exception 'Old token still permitted';end if;
 begin perform public.admin_staff_directory();raise exception 'Non-admin directory allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub','40000000-0000-4000-8000-000000000002','role','authenticated','iat',extract(epoch from now()+interval '3 seconds')::bigint)::text,true);
do $$ begin if not public.staff_access_allowed() then raise exception 'Fresh token blocked';end if;end $$;
update public.staff_members set is_active=false where user_id='40000000-0000-4000-8000-000000000002';
do $$ begin if public.staff_access_allowed() then raise exception 'Inactive account permitted';end if;end $$;
