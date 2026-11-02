-- Scoped fixtures only; caller wraps the entire script in BEGIN ... ROLLBACK.
insert into auth.users(id,email,aud,role) values
 ('10000000-0000-4000-8000-000000000001','reservation-admin@example.invalid','authenticated','authenticated'),
 ('10000000-0000-4000-8000-000000000002','reservation-staff@example.invalid','authenticated','authenticated'),
 ('10000000-0000-4000-8000-000000000003','reservation-user@example.invalid','authenticated','authenticated');
insert into public.staff_members(user_id,role,display_name) values
 ('10000000-0000-4000-8000-000000000001','admin','Contract admin'),
 ('10000000-0000-4000-8000-000000000002','editor','Contract staff');
insert into public.reservations(id,idempotency_key,name,phone,email,visit_date,visit_time,guests,notes) values
 ('10000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000031','Private contract name','0909 000 001','private@example.invalid','2099-11-07','20:15',2,'private-contact-note');

do $$ declare code text; begin
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='reservations' and column_name in ('assigned_to','venue_timezone')) then raise exception 'Unused booking columns remain';end if;
 if to_regclass('public.reservation_activity') is not null or to_regclass('public.content_audit_log') is not null then raise exception 'Split audit tables remain';end if;
 if not exists(select 1 from public.reservations where id='10000000-0000-4000-8000-000000000021' and status='pending' and phone_normalized='84909000001' and reference~'^BR-[0-9A-F]{12}$') then raise exception 'Pending, phone or reference contract failed';end if;
 if (select count(*) from public.audit_log where table_name='reservations' and record_id='10000000-0000-4000-8000-000000000021' and operation='INSERT')<>1 then raise exception 'Reservation creation audit missing';end if;
 if exists(select 1 from public.audit_log where table_name='reservations' and record_id='10000000-0000-4000-8000-000000000021' and (new_data ?| array['name','phone','phone_normalized','email','notes','idempotency_key'] or new_data::text like '%private-contact-note%')) then raise exception 'Audit duplicates contact details';end if;
 begin insert into public.reservations(idempotency_key,name,phone,visit_date,visit_time,guests) values(gen_random_uuid(),'Duplicate','+84 909 000 001','2099-12-01','20:15',2);raise exception 'Pending phone duplicated';
 exception when unique_violation then get stacked diagnostics code=constraint_name;if code<>'reservations_one_pending_phone_idx' then raise exception 'Unexpected duplicate constraint: %',code;end if;end;
 begin insert into public.reservations(idempotency_key,name,phone,visit_date,visit_time,guests) values(gen_random_uuid(),'Duplicate','0084909000001','2099-12-01','20:15',2);raise exception '0084 bypassed pending limit';exception when unique_violation then null;end;
 begin insert into public.reservations(idempotency_key,name,phone,visit_date,visit_time,guests) values('10000000-0000-4000-8000-000000000031','Retry','0909000002','2099-11-07','20:15',2);raise exception 'Idempotency duplicate accepted';exception when unique_violation then null;end;
end $$;

set local role anon;
do $$ begin
 begin perform count(*) from public.reservations;raise exception 'Anonymous reads contacts';exception when insufficient_privilege then null;end;
 begin perform count(*) from public.audit_log;raise exception 'Anonymous reads history';exception when insufficient_privilege then null;end;
 begin insert into public.reservations(idempotency_key,name,phone,visit_date,visit_time,guests)values(gen_random_uuid(),'Anonymous','0909000003','2099-11-07','20:15',2);raise exception 'Anonymous bypasses future endpoint';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.reservations where id='10000000-0000-4000-8000-000000000021') then raise exception 'Non-staff reads contacts';end if;
 if exists(select 1 from public.audit_log where record_id='10000000-0000-4000-8000-000000000021') then raise exception 'Non-staff reads history';end if;
 update public.reservations set status='confirmed' where id='10000000-0000-4000-8000-000000000021';if found then raise exception 'Non-staff changes status';end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
set local role authenticated;
update public.reservations set status='confirmed',updated_by=auth.uid() where id='10000000-0000-4000-8000-000000000021';
do $$ begin
 if not exists(select 1 from public.reservations where id='10000000-0000-4000-8000-000000000021' and status='confirmed') then raise exception 'Staff cannot confirm';end if;
 if not exists(select 1 from public.audit_log where table_name='reservations' and record_id='10000000-0000-4000-8000-000000000021' and action='reservations.status_changed' and actor_id=auth.uid() and old_data->>'status'='pending' and new_data->>'status'='confirmed') then raise exception 'Actor/status audit missing';end if;
 if exists(select 1 from public.audit_log where table_name<>'reservations') then raise exception 'Editor can read unrelated audit';end if;
 begin insert into public.audit_log(table_name,record_id,operation,action)values('reservations','fake','UPDATE','fake');raise exception 'Staff forges audit';exception when insufficient_privilege then null;end;
 begin update public.audit_log set action='fake';raise exception 'Staff rewrites audit';exception when insufficient_privilege then null;end;
 begin update public.reservations set reference='changed' where id='10000000-0000-4000-8000-000000000021';raise exception 'Staff rewrites reference';exception when insufficient_privilege then null;end;
end $$;
-- A returning guest is allowed once the old pending request has been handled.
insert into public.reservations(id,idempotency_key,name,phone,visit_date,visit_time,guests,source)values
 ('10000000-0000-4000-8000-000000000022','10000000-0000-4000-8000-000000000032','Returning contract guest','+84909000001','2099-12-01','20:15',2,'facebook');
update public.reservations set status='unreachable',updated_by=auth.uid() where id='10000000-0000-4000-8000-000000000022';
insert into public.reservations(id,idempotency_key,name,phone,visit_date,visit_time,guests,source)values
 ('10000000-0000-4000-8000-000000000023','10000000-0000-4000-8000-000000000033','Third contract visit','0084909000001','2099-12-07','20:15',2,'phone');
reset role;

-- Service inserts still fire database auditing and normalization.
select set_config('request.jwt.claim.sub','',true);
set local role service_role;
insert into public.reservations(id,idempotency_key,name,phone,visit_date,visit_time,guests)values
 ('10000000-0000-4000-8000-000000000024','10000000-0000-4000-8000-000000000034','Service contract guest','0909000004','2099-11-07','20:15',2);
reset role;

do $$ begin
 if not exists(select 1 from public.audit_log where table_name='reservations' and record_id='10000000-0000-4000-8000-000000000024' and actor_type='guest')then raise exception 'Server guest creation audit missing';end if;
 if exists(select 1 from public.audit_log where table_name='reservations' and record_id like '10000000-%' and (old_data ?| array['phone','email','name','notes'] or new_data ?| array['phone','email','name','notes']))then raise exception 'PII entered common audit';end if;
 if (select count(*) from pg_trigger t join pg_proc p on p.oid=t.tgfoid where not t.tgisinternal and p.proname='audit_application_change')<>9 then raise exception 'Application table audit coverage incomplete';end if;
 if (select count(*) from information_schema.columns where table_schema='public' and table_name='reservations' and column_name in ('created_at','updated_at') and data_type='timestamp with time zone')<>2 then raise exception 'Audit timestamps lost timezone';end if;
end $$;
select 'reservation schema, normalized pending limit, shared audit, roles and privacy checks passed' as verification;
