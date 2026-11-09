-- Unsaved uploads abandoned by a crash become eligible after seven days.
-- Saved content and drafts are still checked by queue_unused_media before deletion.
create function public.expire_abandoned_media_claims() returns integer language plpgsql security definer set search_path='' as $$
declare candidates uuid[];expired integer;
begin
 perform pg_advisory_xact_lock(741329106);
 select array_agg(asset_id)into candidates from public.media_upload_claims where created_at<now()-interval '7 days';
 delete from public.media_upload_claims where created_at<now()-interval '7 days';get diagnostics expired=row_count;
 perform private.queue_unused_media(coalesce(candidates,array[]::uuid[]));return expired;
end $$;
revoke all on function public.expire_abandoned_media_claims() from public,anon,authenticated;
grant execute on function public.expire_abandoned_media_claims() to service_role;
