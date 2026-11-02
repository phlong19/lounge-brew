
alter table public.staff_members add column display_name text not null default 'Nhân viên';
update public.staff_members s set display_name = left(btrim(regexp_replace(
 coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),''),nullif(split_part(u.email,'@',1),''),'Nhân viên'),
 '[[:cntrl:]]','','g')),120)
from auth.users u where u.id=s.user_id;
alter table public.staff_members add constraint staff_display_name_valid check(char_length(btrim(display_name)) between 1 and 120);
create function private.audit_staff_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.content_audit_log(table_name,record_id,operation,actor_id,old_data,new_data)
 values(tg_table_name,case when tg_op='DELETE' then old.user_id::text else new.user_id::text end,tg_op,auth.uid(),
 case when tg_op='INSERT' then null else to_jsonb(old) end,
 case when tg_op='DELETE' then null else to_jsonb(new) end);
 if tg_op='DELETE' then return old; end if; return new;
end; $$;
revoke all on function private.audit_staff_change() from public;
create trigger staff_audit after insert or update or delete on public.staff_members for each row execute function private.audit_staff_change();
comment on column public.staff_members.display_name is 'Staff-facing account display name, separate from authorization role and Auth email.';
