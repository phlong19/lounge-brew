alter table public.staff_members add column tokens_valid_after timestamptz;

create or replace function private.has_staff_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.staff_members s where s.user_id=(select auth.uid()) and s.is_active and s.role=any(allowed_roles)
 and (s.tokens_valid_after is null or coalesce((auth.jwt()->>'iat')::numeric,0)>=extract(epoch from s.tokens_valid_after)));
$$;

create function public.staff_access_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select private.has_staff_role(array['admin','editor','booking']);
$$;
revoke all on function public.staff_access_allowed() from public,anon;
grant execute on function public.staff_access_allowed() to authenticated;

create function public.admin_staff_directory(p_search text default '',p_status text default 'all',p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; page_number integer:=greatest(1,least(10000,p_page));
begin
 if not private.has_staff_role(array['admin']) then raise insufficient_privilege;end if;
 if p_status not in ('all','active','inactive') or length(p_search)>120 then raise invalid_parameter_value;end if;
 with matched as (
 select s.user_id,s.display_name,u.email,s.role,s.is_active,s.created_at
 from public.staff_members s join auth.users u on u.id=s.user_id
 where s.role<>'admin' and (p_status='all' or s.is_active=(p_status='active'))
 and (s.display_name ilike '%'||p_search||'%' or u.email ilike '%'||p_search||'%')
 ), rows as (select * from matched order by created_at desc,user_id offset (page_number-1)*20 limit 20)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(rows)) from rows),'[]'::jsonb),'total',(select count(*) from matched),'page',page_number,'limit',20) into result;
 return result;
end $$;
revoke all on function public.admin_staff_directory(text,text,integer) from public,anon;
grant execute on function public.admin_staff_directory(text,text,integer) to authenticated;

-- Server-only follow-up after verified admin access/Auth operations. Never receives a password.
create function public.finish_staff_security_action(p_target uuid,p_actor uuid,p_action text)
returns integer language plpgsql security definer set search_path='' as $$
declare ended integer;
begin
 if p_action not in ('staff.access_disabled','staff.access_enabled','staff.password_changed') then raise invalid_parameter_value;end if;
 if p_target=p_actor or not exists(select 1 from public.staff_members where user_id=p_actor and role='admin' and is_active)
 or not exists(select 1 from public.staff_members where user_id=p_target and role<>'admin') then raise insufficient_privilege;end if;
 perform set_config('request.jwt.claim.sub',p_actor::text,true);
 update public.staff_members set tokens_valid_after=date_trunc('second',clock_timestamp())+interval '1 second' where user_id=p_target;
 delete from auth.sessions where user_id=p_target;
 get diagnostics ended=row_count;
 insert into public.audit_log(table_name,record_id,operation,action,actor_id,actor_type,metadata,changed_fields)
 values('staff_members',p_target,'UPDATE',p_action,p_actor,'staff',jsonb_build_object('sessions_ended',ended),array[]::text[]);
 return ended;
end $$;
revoke all on function public.finish_staff_security_action(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.finish_staff_security_action(uuid,uuid,text) to service_role;

alter table public.events alter column additional_fee set default 0;
update public.events set additional_fee=0 where additional_fee is null;
