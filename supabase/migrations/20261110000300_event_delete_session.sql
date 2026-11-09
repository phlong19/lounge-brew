-- Deleting from an open editor also releases unsaved replacement/body uploads atomically.
create function public.delete_event_with_session(p_event_id uuid,p_expected_updated_at timestamptz,p_session uuid) returns text language plpgsql security invoker set search_path='' as $$
declare public_id text;
begin
 public_id:=public.delete_event_permanently(p_event_id,p_expected_updated_at);
 if p_session is not null then perform public.release_media_session(p_session);end if;
 return public_id;
end $$;
revoke all on function public.delete_event_with_session(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.delete_event_with_session(uuid,timestamptz,uuid) to authenticated;
