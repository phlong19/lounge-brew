-- Caller wraps this in BEGIN ... ROLLBACK.
do $$ declare relation regclass; role_name text; begin
 for relation in select c.oid::regclass from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') loop
  foreach role_name in array array['anon','authenticated'] loop
   if has_table_privilege(role_name,relation,'TRUNCATE') or has_table_privilege(role_name,relation,'TRIGGER') or has_table_privilege(role_name,relation,'REFERENCES') then raise exception 'Excess table privileges: %, %',role_name,relation;end if;
  end loop;
  if has_table_privilege('anon',relation,'INSERT') or has_table_privilege('anon',relation,'UPDATE') or has_table_privilege('anon',relation,'DELETE') then raise exception 'Anonymous write grant: %',relation;end if;
 end loop;
 if has_function_privilege('anon','public.finish_staff_security_action(uuid,uuid,text)','EXECUTE') or has_function_privilege('authenticated','public.finish_staff_security_action(uuid,uuid,text)','EXECUTE') then raise exception 'Privileged staff RPC exposed';end if;
 if has_function_privilege('anon','public.submit_reservation_request(uuid,text,text,text,boolean,uuid,text,text,text,date,time,integer,text)','EXECUTE') or has_function_privilege('authenticated','public.submit_reservation_request(uuid,text,text,text,boolean,uuid,text,text,text,date,time,integer,text)','EXECUTE') then raise exception 'Guest quota RPC exposed';end if;
end $$;
