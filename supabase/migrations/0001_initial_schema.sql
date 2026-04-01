create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_vi text not null,
  name_en text,
  tab_label_vi text not null,
  tab_label_en text,
  tab_color text not null default '#8c6142',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name_vi text not null,
  name_en text,
  description_vi text,
  description_en text,
  price numeric(10, 0) not null,
  is_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title_vi text not null,
  title_en text,
  performer_name text not null,
  event_date timestamptz not null,
  description_vi text,
  description_en text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title_vi text not null,
  title_en text,
  slug text not null unique,
  content_vi text not null,
  content_en text,
  thumbnail_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_sort_order_idx on public.categories(sort_order);
create index menu_items_category_sort_idx on public.menu_items(category_id, sort_order);
create index events_event_date_idx on public.events(event_date);
create index articles_published_at_idx on public.articles(published_at desc);

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger menu_items_set_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.events enable row level security;
alter table public.articles enable row level security;

create policy "categories_public_read"
on public.categories
for select
using (true);

create policy "categories_authenticated_manage"
on public.categories
for all
to authenticated
using (true)
with check (true);

create policy "menu_items_public_read"
on public.menu_items
for select
using (true);

create policy "menu_items_authenticated_manage"
on public.menu_items
for all
to authenticated
using (true)
with check (true);

create policy "events_public_read"
on public.events
for select
using (is_active = true);

create policy "events_authenticated_manage"
on public.events
for all
to authenticated
using (true)
with check (true);

create policy "articles_public_read"
on public.articles
for select
using (published_at is not null and published_at <= now());

create policy "articles_authenticated_manage"
on public.articles
for all
to authenticated
using (true)
with check (true);
