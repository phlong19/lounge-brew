-- Event articles use content_vi/content_en; short descriptions are unused.
-- Menu item description columns are intentionally unchanged.
alter table public.events
  drop column if exists description_vi,
  drop column if exists description_en;
