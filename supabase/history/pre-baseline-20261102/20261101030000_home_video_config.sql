-- Preserve the current public video on first wiring. Never overwrite an existing configuration.
insert into public.video_settings(id,source_url,provider,heading_vi,heading_en,is_visible)
values('home','https://www.youtube.com/watch?v=gOvPXjqWn1A','YouTube','Video quán cafe Trixie Hà Nội','Trixie on video',true)
on conflict(id) do nothing;
