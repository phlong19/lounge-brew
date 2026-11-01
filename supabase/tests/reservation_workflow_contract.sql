-- Run transactionally with ROLLBACK; no customer or test records remain.
insert into auth.users(id,email,aud,role)values('30000000-0000-4000-8000-000000000001','workflow-staff@example.invalid','authenticated','authenticated');
insert into public.staff_members(user_id,role,display_name)values('30000000-0000-4000-8000-000000000001','editor','Workflow contract staff');
set local role anon;
do $$begin
 begin perform public.submit_reservation_request(gen_random_uuid(),repeat('a',64),repeat('b',64),repeat('c',64),false,null,'Blocked','0909000100',null,'2099-12-01','20:15',2,'');raise exception 'Anonymous executes privileged submit';exception when insufficient_privilege then null;end;
 begin perform count(*) from private.reservation_receipts;raise exception 'Anonymous reads receipts';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role service_role;
do $$declare result text; n integer;begin
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000011',repeat('a',64),repeat('b',64),repeat('c',64),false,null,'Workflow contact','0909000100',null,'2099-12-01','20:15',2,'private workflow note');
 if result<>'received' then raise exception 'Initial receipt failed: %',result;end if;
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000011',repeat('a',64),repeat('b',64),repeat('c',64),false,null,'Workflow contact','0909000100',null,'2099-12-01','20:15',2,'private workflow note');
 if result<>'received' then raise exception 'Idempotent retry failed';end if;
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000011',repeat('d',64),repeat('b',64),repeat('c',64),false,null,'Changed payload','0909000100',null,'2099-12-01','20:15',2,'');
 if result<>'conflict' then raise exception 'Changed retry accepted';end if;
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000012',repeat('e',64),repeat('b',64),repeat('c',64),false,null,'Duplicate phone','+84909000100',null,'2099-12-02','20:15',3,'');
 if result<>'received' then raise exception 'Duplicate pending leaks outcome';end if;
 select count(*)into n from public.reservations where phone_normalized='84909000100';if n<>1 then raise exception 'Duplicate created another booking';end if;
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000013',repeat('f',64),repeat('b',64),repeat('1',64),false,null,'Past','0909000101',null,'2000-01-01','20:15',2,'');
 if result<>'invalid_visit' then raise exception 'Past visit accepted';end if;
 -- 8 requests per IP window, independent of phone.
 for n in 1..8 loop
  result:=public.submit_reservation_request(gen_random_uuid(),repeat('a',64),repeat('2',64),md5(n::text)||md5(n::text),false,null,'Rate fixture','09090002'||lpad(n::text,2,'0'),null,'2099-12-01','20:15',2,'');
  if result<>'received' then raise exception 'IP quota rejected too early %',n;end if;
 end loop;
 result:=public.submit_reservation_request(gen_random_uuid(),repeat('a',64),repeat('2',64),repeat('3',64),false,null,'Over quota','0909000299',null,'2099-12-01','20:15',2,'');
 if result<>'rate_limited' then raise exception 'Persistent IP quota bypassed';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000001',true);
set local role authenticated;
update public.reservations set status='confirmed' where idempotency_key='30000000-0000-4000-8000-000000000011';
do $$begin
 if not exists(select 1 from public.audit_log where table_name='reservations' and action='reservations.status_changed' and actor_id=auth.uid() and new_data->>'status'='confirmed')then raise exception 'Confirmation actor missing';end if;
 begin update public.reservations set status='declined' where idempotency_key='30000000-0000-4000-8000-000000000011';raise exception 'Invalid transition accepted';exception when check_violation then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role service_role;
do $$declare result text;begin
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000014',repeat('a',64),repeat('b',64),repeat('c',64),false,null,'Returning','0909000100',null,'2099-12-03','20:15',2,'');
 if result<>'received' then raise exception 'Returning guest blocked after confirmation';end if;
 result:=public.submit_reservation_request('30000000-0000-4000-8000-000000000015',repeat('a',64),repeat('b',64),repeat('c',64),false,null,'Phone quota','0909000100',null,'2099-12-04','20:15',2,'');
 if result<>'rate_limited' then raise exception 'Phone velocity quota bypassed';end if;
end $$;
reset role;
do $$begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='reservations')then raise exception 'Realtime table missing';end if;
 if exists(select 1 from public.audit_log where table_name='reservations' and new_data::text like '%private workflow note%')then raise exception 'Contact note leaked to audit';end if;
end $$;
select 'guest idempotency, neutral duplicates, durable rate limits, lifecycle, audit and realtime contract passed' as verification;
