insert into auth.users(id,email) values
('60000000-0000-4000-8000-000000000001','video-editor@example.invalid'),
('60000000-0000-4000-8000-000000000002','video-booking@example.invalid');
insert into public.staff_members(user_id,display_name,role,is_active) values
('60000000-0000-4000-8000-000000000001','Video editor','editor',true);
select set_config('request.jwt.claims',jsonb_build_object('sub','60000000-0000-4000-8000-000000000001','role','authenticated','iat',extract(epoch from now())::bigint)::text,true);
set local role authenticated;
do $$ declare changed integer;begin
 if not exists(select 1 from public.video_settings where id='home') then raise exception 'Singleton not initialized';end if;
 update public.video_settings set is_visible=false,heading_vi='Video contract heading',updated_by=auth.uid() where id='home';
 get diagnostics changed=row_count;
 if changed<>1 then raise exception 'Editor cannot manage video';end if;
end $$;
reset role;
do $$ begin
 if not exists(select 1 from public.audit_log where table_name='video_settings' and record_id='home' and actor_id='60000000-0000-4000-8000-000000000001' and new_data->>'heading_vi'='Video contract heading') then raise exception 'Video actor audit missing';end if;
end $$;
set local role anon;
do $$ begin if exists(select 1 from public.video_settings where id='home') then raise exception 'Hidden video exposed';end if;end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub','60000000-0000-4000-8000-000000000002','role','authenticated','iat',extract(epoch from now())::bigint)::text,true);
set local role authenticated;
do $$ declare changed integer;begin
 update public.video_settings set heading_vi='Forbidden change' where id='home';get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Non-staff account can modify video';end if;
end $$;
reset role;
