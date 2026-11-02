-- Vietnam-only reservation fields and one shared application audit stream.
-- Existing content and reservation history are retained in audit_log.
lock table public.categories,public.menu_items,public.events,public.articles,public.media_assets,
 public.video_settings,public.seating_settings,public.staff_members,public.reservations,
 public.reservation_activity,public.content_audit_log in access exclusive mode;

alter table public.content_audit_log rename to audit_log;
alter sequence public.content_audit_log_id_seq rename to audit_log_id_seq;
alter table public.audit_log
 add column action text,
 add column actor_type text not null default 'system' check(actor_type in ('staff','guest','system')),
 add column changed_fields text[] not null default array[]::text[],
 add column metadata jsonb not null default '{}'::jsonb;
update public.audit_log set action=table_name||'.'||lower(operation),actor_type=case when actor_id is null then 'system' else 'staff' end;
alter table public.audit_log alter column action set not null;
create index audit_log_record_idx on public.audit_log(table_name,record_id,created_at desc,id desc);
create index audit_log_actor_idx on public.audit_log(actor_id,created_at desc);

insert into public.audit_log(table_name,record_id,operation,actor_id,old_data,new_data,created_at,action,actor_type,changed_fields,metadata)
select 'reservations',reservation_id::text,case when previous_status is null then 'INSERT' else 'UPDATE' end,actor_id,
 case when previous_status is null then null else jsonb_build_object('status',previous_status) end,
 jsonb_build_object('status',new_status),created_at,'reservations.status_changed',
 case when actor_id is not null then 'staff' else 'system' end,array['status'],jsonb_build_object('legacy_activity_id',id)
from public.reservation_activity;

do $$ declare item record; begin
 for item in select t.tgname,n.nspname,c.relname from pg_trigger t join pg_class c on c.oid=t.tgrelid
 join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid join pg_namespace fn on fn.oid=p.pronamespace
 where not t.tgisinternal and fn.nspname='private' and p.proname in ('audit_content_change','audit_staff_change','record_reservation_status')
 loop execute format('drop trigger %I on %I.%I',item.tgname,item.nspname,item.relname); end loop;
end $$;
drop function private.audit_content_change();
drop function private.audit_staff_change();
drop function private.record_reservation_status();
drop table public.reservation_activity;

alter table public.reservations drop column venue_timezone,drop column assigned_to;
alter table public.reservations drop constraint reservations_status_check;
alter table public.reservations add column source text not null default 'website'
 check(source in ('website','facebook','zalo','phone','other'));

create function private.normalize_reservation_phone(value text) returns text
language sql immutable strict parallel safe set search_path='' as $$
 select case when digits like '0084%' then '84'||ltrim(substr(digits,5),'0')
  when digits like '84%' then '84'||ltrim(substr(digits,3),'0')
  when digits like '0%' then '84'||substr(digits,2) else digits end
 from (select regexp_replace(value,'[^0-9]','','g') as digits) normalized;
$$;
revoke all on function private.normalize_reservation_phone(text) from public;
grant execute on function private.normalize_reservation_phone(text) to authenticated,service_role;
grant usage on schema private to service_role;
alter table public.reservations add column phone_normalized text
 generated always as (private.normalize_reservation_phone(phone)) stored;

create function private.audit_application_change() returns trigger
language plpgsql security definer set search_path='' as $$
declare before_row jsonb; after_row jsonb; old_snapshot jsonb; new_snapshot jsonb; fields text[]; entity text;
begin
 before_row:=case when tg_op='INSERT' then null else to_jsonb(old) end;
 after_row:=case when tg_op='DELETE' then null else to_jsonb(new) end;
 entity:=coalesce(after_row->>'id',after_row->>'user_id',before_row->>'id',before_row->>'user_id');
 select coalesce(array_agg(key order by key),array[]::text[]) into fields
 from (select key from jsonb_object_keys(coalesce(before_row,'{}'::jsonb)||coalesce(after_row,'{}'::jsonb)) as keys(key)
 where key not in ('created_at','updated_at','updated_by') and before_row->key is distinct from after_row->key) changed;
 if tg_op='UPDATE' and cardinality(fields)=0 then return new; end if;
 old_snapshot:=before_row;new_snapshot:=after_row;
 if tg_table_name='reservations' then
  -- Contact details stay in reservations; do not duplicate them in history snapshots.
  select jsonb_object_agg(key,value) into old_snapshot from jsonb_each(coalesce(before_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
  select jsonb_object_agg(key,value) into new_snapshot from jsonb_each(coalesce(after_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
 end if;
 insert into public.audit_log(table_name,record_id,operation,actor_id,old_data,new_data,action,actor_type,changed_fields)
 values(tg_table_name,entity,tg_op,auth.uid(),old_snapshot,new_snapshot,
 tg_table_name||'.'||case when tg_op='UPDATE' and tg_table_name='reservations' and before_row->'status' is distinct from after_row->'status' then 'status_changed' else lower(tg_op) end,
 case when auth.uid() is not null then 'staff' when tg_op='INSERT' and tg_table_name='reservations' and after_row->>'source'='website' then 'guest' else 'system' end,fields);
 if tg_op='DELETE' then return old; end if;return new;
end $$;
revoke all on function private.audit_application_change() from public;
do $$ declare entity text; begin
 foreach entity in array array['categories','menu_items','events','articles','media_assets','video_settings','seating_settings','staff_members','reservations']
 loop execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.audit_application_change()',entity||'_audit',entity); end loop;
end $$;

-- Preserve old lifecycle history, then record the transition to the new pending state.
update public.reservations set status='pending' where status in ('new','contacted');
alter table public.reservations alter column status set default 'pending';
alter table public.reservations add constraint reservations_status_check
 check(status in ('pending','confirmed','declined','cancelled','unreachable'));
-- Atomic protection: formatting and +84/0 variants cannot bypass the pending-request limit.
create unique index reservations_one_pending_phone_idx on public.reservations(phone_normalized) where status='pending';
alter table public.reservations alter column reference set default ('BR-'||upper(left(replace(gen_random_uuid()::text,'-',''),12)));

-- Standard staff accounts can handle inquiries; there is no assignment workflow.
drop policy reservations_staff_read on public.reservations;
drop policy reservations_staff_insert on public.reservations;
drop policy reservations_staff_update on public.reservations;
create policy reservations_staff_read on public.reservations for select to authenticated using((select private.has_staff_role(array['admin','editor','booking'])));
create policy reservations_staff_insert on public.reservations for insert to authenticated with check((select private.has_staff_role(array['admin','editor','booking'])));
create policy reservations_staff_update on public.reservations for update to authenticated
 using((select private.has_staff_role(array['admin','editor','booking']))) with check((select private.has_staff_role(array['admin','editor','booking'])));
-- Prevent client changes to identifiers, original creation time or generated values.
revoke update on public.reservations from authenticated;
grant update(event_id,name,phone,email,visit_date,visit_time,guests,notes,status,source,updated_by) on public.reservations to authenticated;

drop policy audit_admin_read on public.audit_log;
create policy audit_staff_read on public.audit_log for select to authenticated using(
 (select private.has_staff_role(array['admin'])) or
 (table_name='reservations' and (select private.has_staff_role(array['admin','editor','booking'])))
);
revoke all on public.audit_log from anon,authenticated;
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
grant usage,select on sequence public.audit_log_id_seq to service_role;

comment on table public.audit_log is 'Append-only application history for content, media, staff, seating and reservations. Reservation contact fields are excluded from snapshots.';
comment on table public.reservations is 'Private Vietnam-local booking inquiries. Pending means received, not confirmed. Only one pending inquiry per normalized phone.';
comment on column public.reservations.reference is 'Guest/staff lookup code, not authorization or duplicate protection. New codes are BR- plus 12 uppercase hex characters.';
comment on column public.reservations.idempotency_key is 'Stable retry token for one form submission, separate from the phone-based pending-request limit.';
comment on column public.reservations.phone_normalized is 'Canonical digits; Vietnamese 0, +84 and 0084 prefixes resolve to the same phone. Never public.';
comment on column public.reservations.visit_date is 'Calendar date in Vietnam. Combine with visit_time using fixed Asia/Ho_Chi_Minh configuration.';
comment on column public.reservations.visit_time is 'Local venue time, without time zone. Audit/creation timestamps remain timestamptz.';
notify pgrst,'reload schema';
