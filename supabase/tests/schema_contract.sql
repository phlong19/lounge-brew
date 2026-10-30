-- Run after the migrations inside BEGIN ... ROLLBACK. No fixtures survive.
insert into auth.users(id,email,aud,role) values
 ('00000000-0000-4000-8000-000000000001','schema-admin@example.invalid','authenticated','authenticated'),
 ('00000000-0000-4000-8000-000000000002','schema-editor@example.invalid','authenticated','authenticated'),
 ('00000000-0000-4000-8000-000000000003','schema-booking@example.invalid','authenticated','authenticated'),
 ('00000000-0000-4000-8000-000000000004','schema-user@example.invalid','authenticated','authenticated');
insert into public.staff_members(user_id,role) values
 ('00000000-0000-4000-8000-000000000001','admin'),
 ('00000000-0000-4000-8000-000000000002','editor'),
 ('00000000-0000-4000-8000-000000000003','booking');
insert into public.events(id,source_id,title_vi,title_en,performer_name,event_date,end_date,cover_image_url,content_vi,additional_fee,is_active) values
 ('00000000-0000-4000-8000-000000000011','source-11','Visible show','English title','Artist','2099-11-07T20:15:00+07','2099-11-07T22:00:00+07','/trixie/test.jpg','<h2>Full page</h2><p><u><span data-text-color="#18af76" style="color:#18af76">Body</span></u></p>',250000,true),
 ('00000000-0000-4000-8000-000000000012','source-12','Hidden show',null,'Artist','2099-11-09T20:15:00+07',null,'/trixie/test.jpg','',null,false);
insert into public.video_settings(id,source_url,provider,heading_vi,heading_en,is_visible) values ('home','https://www.youtube.com/watch?v=gOvPXjqWn1A','YouTube','Tiêu đề','Heading',false);
insert into public.reservations(id,idempotency_key,event_id,name,phone,email,visit_date,visit_time,guests,notes) values
 ('00000000-0000-4000-8000-000000000021','00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000011','Schema test','0977165165','test@example.invalid','2099-11-07','20:15',2,'Test note');

do $$ begin
 if (select public_id from public.events where source_id='source-11') <> 'source-11' then raise exception 'Legacy public ID not preserved'; end if;
 if (select additional_fee from public.events where source_id='source-11') <> 250000 then raise exception 'Fee not an integer'; end if;
 if (select count(*) from public.reservation_activity) <> 1 then raise exception 'Reservation audit missing'; end if;
 if (select count(*) from public.content_audit_log) <> 3 then raise exception 'Content audit missing'; end if;
 begin insert into public.events(title_vi,performer_name,event_date) values('Missing cover','Artist',now()); raise exception 'Missing poster accepted'; exception when check_violation then null; end;
 begin update public.events set additional_fee=-1 where source_id='source-11'; raise exception 'Negative fee accepted'; exception when check_violation then null; end;
 begin update public.events set end_date=event_date-interval '1 second' where source_id='source-11'; raise exception 'Invalid time range accepted'; exception when check_violation then null; end;
 begin insert into public.reservations(idempotency_key,name,phone,visit_date,visit_time,guests) values('00000000-0000-4000-8000-000000000031','Duplicate','0977165165','2099-11-07','20:15',2); raise exception 'Duplicate booking accepted'; exception when unique_violation then null; end;
end $$;

set local role anon;
do $$ begin
 if (select count(*) from public.events) <> 1 then raise exception 'Anonymous sees hidden events'; end if;
 if (select count(*) from public.video_settings) <> 0 then raise exception 'Anonymous sees hidden video'; end if;
 begin perform count(*) from public.reservations; raise exception 'Anonymous reads booking contacts'; exception when insufficient_privilege then null; end;
 begin insert into public.events(title_vi,performer_name,event_date,cover_image_url) values('Anonymous write','Artist',now(),'/trixie/test.jpg'); raise exception 'Anonymous writes content'; exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.events) <> 1 then raise exception 'Ordinary user sees hidden content'; end if;
 if (select count(*) from public.reservations) <> 0 then raise exception 'Ordinary user sees booking contacts'; end if;
 begin insert into public.staff_members(user_id,role) values(auth.uid(),'admin'); raise exception 'Self-promotion allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.events(title_vi,performer_name,event_date,cover_image_url) values('Ordinary write','Artist',now(),'/trixie/test.jpg'); raise exception 'Ordinary user writes content'; exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.events) <> 2 then raise exception 'Editor cannot see hidden events'; end if;
 if (select count(*) from public.reservations) <> 0 then raise exception 'Editor sees booking contacts'; end if;
 update public.events set content_en='<p>English content</p>',additional_fee=0 where source_id='source-11';
 update public.video_settings set heading_vi='Updated heading' where id='home';
 if not found then raise exception 'Editor cannot edit video'; end if;
 begin update public.staff_members set role='admin' where user_id=auth.uid(); if found then raise exception 'Editor promoted self'; end if; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.reservations) <> 1 then raise exception 'Booking staff cannot see request'; end if;
 update public.reservations set status='contacted' where id='00000000-0000-4000-8000-000000000021';
 if not found then raise exception 'Booking staff cannot update request'; end if;
 if (select count(*) from public.reservation_activity) <> 2 then raise exception 'Status activity missing'; end if;
 update public.events set title_vi='Unauthorized change' where source_id='source-11';
 if found then raise exception 'Booking staff can edit content'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.staff_members) <> 3 then raise exception 'Admin cannot manage staff'; end if;
 if (select count(*) from public.content_audit_log) < 5 then raise exception 'Admin audit missing'; end if;
end $$;
reset role;
select 'schema, constraints, roles, private data, audit and idempotency checks passed' as verification;
