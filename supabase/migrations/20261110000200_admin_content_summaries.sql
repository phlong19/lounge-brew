-- Keep article bodies out of paginated admin lists; detail queries fetch one full entry.
create view public.admin_event_summaries with(security_invoker=true) as
 select id,coalesce(data->>'title_vi','')title_vi,data->>'title_en'title_en,coalesce(data->>'performer_name','')performer_name,coalesce(data->>'event_date','')event_date,data->>'end_date'end_date,data->>'cover_image_url'cover_image_url,data->>'cover_asset_id'cover_asset_id,
 case data->>'is_active'when 'true'then true else false end is_active,
 case when data->>'additional_fee'~'^[0-9]{1,16}$'then(data->>'additional_fee')::bigint else 0 end additional_fee,
 false is_deleted,updated_at,is_draft
 from public.admin_content_entries where kind='event';
create view public.admin_article_summaries with(security_invoker=true) as
 select id,coalesce(data->>'title_vi','')title_vi,data->>'title_en'title_en,coalesce(data->>'slug','')slug,data->>'thumbnail_url'thumbnail_url,data->>'published_at'published_at,updated_at,is_draft
 from public.admin_content_entries where kind='article';
revoke all on public.admin_event_summaries,public.admin_article_summaries from public,anon;
grant select on public.admin_event_summaries,public.admin_article_summaries to authenticated;
