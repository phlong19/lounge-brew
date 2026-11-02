-- Required platform/config rows only; no staff, credentials or customer/content fixtures.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
 ('lounge-drafts','lounge-drafts',false,10485760,array['image/jpeg','image/png','image/webp']),
 ('lounge-public','lounge-public',true,10485760,array['image/jpeg','image/png','image/webp'])
 ON CONFLICT(id) DO NOTHING;
INSERT INTO public.seating_settings(id) VALUES('home') ON CONFLICT(id) DO NOTHING;
-- Preserve the current public video on first wiring. Never overwrite an existing configuration.
insert into public.video_settings(id,source_url,provider,heading_vi,heading_en,is_visible)
values('home','https://www.youtube.com/watch?v=gOvPXjqWn1A','YouTube','Video quán cafe Trixie Hà Nội','Trixie on video',true)
on conflict(id) do nothing;
