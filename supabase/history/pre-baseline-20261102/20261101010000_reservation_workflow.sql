-- Atomic guest receipt, persistent abuse limits, lifecycle checks and staff-only realtime.
create table private.reservation_receipts (
 idempotency_key uuid primary key,
 fingerprint text not null check(fingerprint ~ '^[0-9a-f]{64}$'),
 reservation_id uuid references public.reservations(id) on delete set null,
 created_at timestamptz not null default now()
);
create index reservation_receipts_created_idx on private.reservation_receipts(created_at);
alter table private.reservation_receipts enable row level security;
revoke all on private.reservation_receipts from public,anon,authenticated;
create table private.reservation_limits (
 bucket_key text primary key,
 used_count integer not null check(used_count>0),
 window_end timestamptz not null
);
create index reservation_limits_expiry_idx on private.reservation_limits(window_end);
alter table private.reservation_limits enable row level security;
revoke all on private.reservation_limits from public,anon,authenticated;

create function private.consume_reservation_limit(bucket text,maximum integer,duration interval) returns boolean
language plpgsql security definer set search_path='' as $$
declare used integer;begin
 insert into private.reservation_limits(bucket_key,used_count,window_end)values(bucket,1,clock_timestamp()+duration)
 on conflict(bucket_key)do update set used_count=case when reservation_limits.window_end<=clock_timestamp() then 1 else reservation_limits.used_count+1 end,
 window_end=case when reservation_limits.window_end<=clock_timestamp() then clock_timestamp()+duration else reservation_limits.window_end end
 returning used_count into used;
 return used<=maximum;
end $$;
revoke all on function private.consume_reservation_limit(text,integer,interval) from public,anon,authenticated;

create function private.validate_reservation_lifecycle() returns trigger
language plpgsql security definer set search_path='' as $$
declare show_row public.events%rowtype; validate_visit boolean;begin
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.reference is distinct from old.reference or new.idempotency_key is distinct from old.idempotency_key or new.created_at is distinct from old.created_at then
   raise check_violation using message='reservation_identifiers_immutable';end if;
  if new.status is distinct from old.status and not (
   (old.status='pending' and new.status in ('confirmed','declined','cancelled','unreachable')) or
   (old.status='confirmed' and new.status='cancelled') or
   (old.status in ('cancelled','declined','unreachable') and new.status='pending')
  )then raise check_violation using message='reservation_transition_invalid';end if;
  validate_visit:=new.event_id is distinct from old.event_id or new.visit_date is distinct from old.visit_date or new.visit_time is distinct from old.visit_time or (new.status='pending' and old.status<>'pending');
 else
  if new.status not in ('pending','confirmed')then raise check_violation using message='reservation_initial_status_invalid';end if;
  validate_visit:=true;
 end if;
 if validate_visit then
  if (new.visit_date+new.visit_time) at time zone 'Asia/Ho_Chi_Minh'<=clock_timestamp() then raise check_violation using message='reservation_visit_past';end if;
  if new.event_id is not null then
   select * into show_row from public.events where id=new.event_id for share;
   if not found or not show_row.is_active or show_row.is_deleted or show_row.event_date<=clock_timestamp() or new.visit_date<>(show_row.event_date at time zone 'Asia/Ho_Chi_Minh')::date then
    raise check_violation using message='reservation_event_unavailable';end if;
  end if;
 end if;
 new.updated_by:=auth.uid();return new;
end $$;
revoke all on function private.validate_reservation_lifecycle() from public,anon,authenticated;
create trigger reservations_lifecycle before insert or update on public.reservations for each row execute function private.validate_reservation_lifecycle();

create function public.submit_reservation_request(
 p_key uuid,p_fingerprint text,p_ip_hash text,p_phone_hash text,p_shared_ip boolean,
 p_event_id uuid,p_name text,p_phone text,p_email text,p_visit_date date,p_visit_time time,p_guests integer,p_notes text
)returns text language plpgsql security definer set search_path='' as $$
declare receipt private.reservation_receipts%rowtype; booking_id uuid; violated text;begin
 if p_key is null or p_fingerprint !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' or p_phone_hash !~ '^[0-9a-f]{64}$' then return 'invalid';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into receipt from private.reservation_receipts where idempotency_key=p_key;
 if found then return case when receipt.fingerprint=p_fingerprint then 'received' else 'conflict' end;end if;
 delete from private.reservation_receipts where created_at<now()-interval '7 days';
 delete from private.reservation_limits where window_end<now()-interval '1 day';
 if not private.consume_reservation_limit('ip:'||p_ip_hash,case when p_shared_ip then 60 else 8 end,interval '15 minutes')
  or not private.consume_reservation_limit('phone:'||p_phone_hash,3,interval '1 hour') then return 'rate_limited';end if;
 begin
  insert into public.reservations(idempotency_key,event_id,name,phone,email,visit_date,visit_time,guests,notes,status,source)
  values(p_key,p_event_id,p_name,p_phone,p_email,p_visit_date,p_visit_time,p_guests,p_notes,'pending','website') returning id into booking_id;
 exception when unique_violation then
  get stacked diagnostics violated=constraint_name;
  if violated<>'reservations_one_pending_phone_idx' then raise;end if;
  -- Same neutral outcome: never reveal an existing guest, reference or booking state.
  booking_id:=null;
 when check_violation then return 'invalid_visit';
 end;
 insert into private.reservation_receipts(idempotency_key,fingerprint,reservation_id)values(p_key,p_fingerprint,booking_id);
 return 'received';
end $$;
revoke all on function public.submit_reservation_request(uuid,text,text,text,boolean,uuid,text,text,text,date,time,integer,text) from public,anon,authenticated;
grant execute on function public.submit_reservation_request(uuid,text,text,text,boolean,uuid,text,text,text,date,time,integer,text) to service_role;
comment on function public.submit_reservation_request(uuid,text,text,text,boolean,uuid,text,text,text,date,time,integer,text) is 'Server-only guest receipt. Idempotency, pending-phone deduplication and persistent hashed abuse limits are atomic; returns no contact data.';

do $$ begin
 if not exists(select 1 from pg_publication where pubname='supabase_realtime')then raise exception 'Supabase Realtime publication is missing';end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='reservations')then
  alter publication supabase_realtime add table public.reservations;
 end if;
end $$;
notify pgrst,'reload schema';
