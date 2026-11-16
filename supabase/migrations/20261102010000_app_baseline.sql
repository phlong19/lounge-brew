-- Final application schema. Requires Supabase-managed auth/storage schemas and roles.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA private;

CREATE SCHEMA IF NOT EXISTS public;

COMMENT ON SCHEMA public IS 'standard public schema';

CREATE FUNCTION private.audit_application_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare before_row jsonb; after_row jsonb; old_snapshot jsonb; new_snapshot jsonb; fields text[]; entity text;
begin
 before_row:=case when tg_op='INSERT' then null else to_jsonb(old) end;
 after_row:=case when tg_op='DELETE' then null else to_jsonb(new) end;
 entity:=coalesce(after_row->>'id',after_row->>'user_id',before_row->>'id',before_row->>'user_id');
 select coalesce(array_agg(key order by key),array[]::text[]) into fields
 from (select key from jsonb_object_keys(coalesce(before_row,'{}'::jsonb)||coalesce(after_row,'{}'::jsonb)) as keys(key)
 where key not in ('created_at','updated_at','updated_by') and before_row->key is distinct from after_row->key) changed;
 if tg_op='UPDATE' and cardinality(fields)=0 then return new; end if;
 old_snapshot:=before_row;new_snapshot:=after_row;
 if tg_table_name='reservations' then
  -- Contact details stay in reservations; do not duplicate them in history snapshots.
  select jsonb_object_agg(key,value) into old_snapshot from jsonb_each(coalesce(before_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
  select jsonb_object_agg(key,value) into new_snapshot from jsonb_each(coalesce(after_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
 end if;
 insert into public.audit_log(table_name,record_id,operation,actor_id,old_data,new_data,action,actor_type,changed_fields)
 values(tg_table_name,entity,tg_op,auth.uid(),old_snapshot,new_snapshot,
 tg_table_name||'.'||case when tg_op='UPDATE' and tg_table_name='reservations' and before_row->'status' is distinct from after_row->'status' then 'status_changed' else lower(tg_op) end,
 case when auth.uid() is not null then 'staff' when tg_op='INSERT' and tg_table_name='reservations' and after_row->>'source'='website' then 'guest' else 'system' end,fields);
 if tg_op='DELETE' then return old; end if;return new;
end $$;

CREATE FUNCTION private.consume_reservation_limit(bucket text, maximum integer, duration interval) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare used integer;begin
 insert into private.reservation_limits(bucket_key,used_count,window_end)values(bucket,1,clock_timestamp()+duration)
 on conflict(bucket_key)do update set used_count=case when reservation_limits.window_end<=clock_timestamp() then 1 else reservation_limits.used_count+1 end,
 window_end=case when reservation_limits.window_end<=clock_timestamp() then clock_timestamp()+duration else reservation_limits.window_end end
 returning used_count into used;
 return used<=maximum;
end $$;

CREATE FUNCTION private.has_staff_role(allowed_roles text[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
 select exists(select 1 from public.staff_members s where s.user_id=(select auth.uid()) and s.is_active and s.role=any(allowed_roles)
 and (s.tokens_valid_after is null or coalesce((auth.jwt()->>'iat')::numeric,0)>=extract(epoch from s.tokens_valid_after)));
$$;

CREATE FUNCTION private.normalize_reservation_phone(value text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    SET search_path TO ''
    AS $$
 select case when digits like '0084%' then '84'||ltrim(substr(digits,5),'0')
  when digits like '84%' then '84'||ltrim(substr(digits,3),'0')
  when digits like '0%' then '84'||substr(digits,2) else digits end
 from (select regexp_replace(value,'[^0-9]','','g') as digits) normalized;
$$;

CREATE FUNCTION private.validate_event_cover() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
 if new.is_active and new.cover_asset_id is not null and not exists (
   select 1 from public.media_assets m where m.id=new.cover_asset_id and (m.provider='r2' or (m.provider='supabase' and m.bucket_id='lounge-public'))
 ) then raise check_violation using message='Publish the poster before showing the event.'; end if;
 return new;
end; $$;

CREATE FUNCTION private.validate_reservation_lifecycle() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare show_row public.events%rowtype; validate_visit boolean;begin
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.reference is distinct from old.reference or new.idempotency_key is distinct from old.idempotency_key or new.created_at is distinct from old.created_at then
   raise check_violation using message='reservation_identifiers_immutable';end if;
  if new.status is distinct from old.status and not (
   (old.status='pending' and new.status in ('confirmed','declined','cancelled','unreachable')) or
   (old.status='confirmed' and new.status='cancelled') or
   (old.status in ('cancelled','declined','unreachable') and new.status='pending')
  )then raise check_violation using message='reservation_transition_invalid';end if;
  validate_visit:=new.event_id is distinct from old.event_id or new.visit_date is distinct from old.visit_date or new.visit_time is distinct from old.visit_time or (new.status='pending' and old.status<>'pending');
 else
  if new.status not in ('pending','confirmed')then raise check_violation using message='reservation_initial_status_invalid';end if;
  validate_visit:=true;
 end if;
 if validate_visit then
  if (new.visit_date+new.visit_time) at time zone 'Asia/Ho_Chi_Minh'<=clock_timestamp() then raise check_violation using message='reservation_visit_past';end if;
  if new.event_id is not null then
   select * into show_row from public.events where id=new.event_id for share;
   if not found or show_row.status <> 'ready' or not show_row.is_active or show_row.is_deleted or show_row.event_date<=clock_timestamp() or new.visit_date<>(show_row.event_date at time zone 'Asia/Ho_Chi_Minh')::date then
    raise check_violation using message='reservation_event_unavailable';end if;
  end if;
 end if;
 new.updated_by:=auth.uid();return new;
end $$;

CREATE FUNCTION private.validate_seating_assets() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
 if exists (select 1 from public.media_assets where id in (new.lower_asset_id,new.upper_asset_id) and (provider <> 'supabase' or bucket_id <> 'lounge-public')) then
  raise exception 'Seating maps must be public Supabase images' using errcode = '23514';
 end if;
 return new;
end;
$$;

CREATE FUNCTION public.admin_staff_directory(p_search text DEFAULT ''::text, p_status text DEFAULT 'all'::text, p_page integer DEFAULT 1) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
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

CREATE FUNCTION public.finish_staff_security_action(p_target uuid, p_actor uuid, p_action text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
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

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin new.updated_at = pg_catalog.now(); return new; end;
$$;

CREATE FUNCTION public.staff_access_allowed() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
 select private.has_staff_role(array['admin','editor','booking']);
$$;

CREATE FUNCTION public.submit_reservation_request(p_key uuid, p_fingerprint text, p_ip_hash text, p_phone_hash text, p_shared_ip boolean, p_event_id uuid, p_name text, p_phone text, p_email text, p_visit_date date, p_visit_time time without time zone, p_guests integer, p_notes text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
declare receipt private.reservation_receipts%rowtype; booking_id uuid; violated text;begin
 if p_key is null or p_fingerprint !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' or p_phone_hash !~ '^[0-9a-f]{64}$' then return 'invalid';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into receipt from private.reservation_receipts where idempotency_key=p_key;
 if found then return case when receipt.fingerprint=p_fingerprint then 'received' else 'conflict' end;end if;
 delete from private.reservation_receipts where created_at<now()-interval '7 days';
 delete from private.reservation_limits where window_end<now()-interval '1 day';
 if not private.consume_reservation_limit('ip:'||p_ip_hash,case when p_shared_ip then 60 else 8 end,interval '15 minutes')
  or not private.consume_reservation_limit('phone:'||p_phone_hash,3,interval '1 hour') then return 'rate_limited';end if;
 begin
  insert into public.reservations(idempotency_key,event_id,name,phone,email,visit_date,visit_time,guests,notes,status,source)
  values(p_key,p_event_id,p_name,p_phone,p_email,p_visit_date,p_visit_time,p_guests,p_notes,'pending','website') returning id into booking_id;
 exception when unique_violation then
  get stacked diagnostics violated=constraint_name;
  if violated<>'reservations_one_pending_phone_idx' then raise;end if;
  -- Same neutral outcome: never reveal an existing guest, reference or booking state.
  booking_id:=null;
 when check_violation then return 'invalid_visit';
 end;
 insert into private.reservation_receipts(idempotency_key,fingerprint,reservation_id)values(p_key,p_fingerprint,booking_id);
 return 'received';
end $_$;

COMMENT ON FUNCTION public.submit_reservation_request(p_key uuid, p_fingerprint text, p_ip_hash text, p_phone_hash text, p_shared_ip boolean, p_event_id uuid, p_name text, p_phone text, p_email text, p_visit_date date, p_visit_time time without time zone, p_guests integer, p_notes text) IS 'Server-only guest receipt. Idempotency, pending-phone deduplication and persistent hashed abuse limits are atomic; returns no contact data.';

SET default_tablespace = '';

SET default_table_access_method = heap;

CREATE TABLE private.reservation_limits (
    bucket_key text NOT NULL,
    used_count integer NOT NULL,
    window_end timestamp with time zone NOT NULL,
    CONSTRAINT reservation_limits_used_count_check CHECK ((used_count > 0))
);

CREATE TABLE private.reservation_receipts (
    idempotency_key uuid NOT NULL,
    fingerprint text NOT NULL,
    reservation_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reservation_receipts_fingerprint_check CHECK ((fingerprint ~ '^[0-9a-f]{64}$'::text))
);

CREATE TABLE public.articles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_vi text DEFAULT '' NOT NULL,
    status text DEFAULT 'ready' NOT NULL CHECK (status IN ('draft', 'ready')),
    title_en text,
    slug text,
    content_vi text NOT NULL,
    content_en text,
    thumbnail_url text,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT articles_ready_fields CHECK (status = 'draft' OR (btrim(title_vi) <> '' AND slug IS NOT NULL AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'))
);

CREATE TABLE public.audit_log (
    id bigint NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    operation text NOT NULL,
    actor_id uuid,
    old_data jsonb,
    new_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    action text NOT NULL,
    actor_type text DEFAULT 'system'::text NOT NULL,
    changed_fields text[] DEFAULT ARRAY[]::text[] NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT audit_log_actor_type_check CHECK ((actor_type = ANY (ARRAY['staff'::text, 'guest'::text, 'system'::text]))),
    CONSTRAINT content_audit_log_operation_check CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

COMMENT ON TABLE public.audit_log IS 'Append-only application history for content, media, staff, seating and reservations. Reservation contact fields are excluded from snapshots.';

ALTER TABLE public.audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_vi text NOT NULL,
    name_en text,
    tab_label_vi text NOT NULL,
    tab_label_en text,
    tab_color text DEFAULT '#8c6142'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title_vi text DEFAULT '' NOT NULL,
    status text DEFAULT 'ready' NOT NULL CHECK (status IN ('draft', 'ready')),
    title_en text,
    performer_name text DEFAULT '' NOT NULL,
    event_date timestamp with time zone,
    cover_image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source_id text,
    public_id text GENERATED ALWAYS AS (COALESCE(source_id, (id)::text)) STORED NOT NULL,
    source_url text,
    end_date timestamp with time zone,
    content_vi text DEFAULT ''::text NOT NULL,
    content_en text,
    additional_fee bigint DEFAULT 0,
    cover_asset_id uuid,
    created_by uuid DEFAULT auth.uid(),
    updated_by uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    ticket_palette_key text,
    ticket_palette_override text,
    CONSTRAINT events_additional_fee_valid CHECK (((additional_fee IS NULL) OR ((additional_fee >= 0) AND (additional_fee <= '9007199254740991'::bigint)))),
    CONSTRAINT events_artist_not_blank CHECK (status = 'draft' OR ((btrim(performer_name) <> ''::text))),
    CONSTRAINT events_cover_required CHECK (status = 'draft' OR (((cover_asset_id IS NOT NULL) OR (NULLIF(btrim(cover_image_url), ''::text) IS NOT NULL)))),
    CONSTRAINT events_cover_url_safe CHECK (((cover_image_url IS NULL) OR (cover_image_url ~ '^(https://|/trixie/)'::text))),
    CONSTRAINT events_source_https CHECK (((source_url IS NULL) OR (source_url ~ '^https://'::text))),
    CONSTRAINT events_source_id_not_blank CHECK (((source_id IS NULL) OR (btrim(source_id) <> ''::text))),
    CONSTRAINT events_title_not_blank CHECK (status = 'draft' OR ((btrim(title_vi) <> ''::text))),
    CONSTRAINT events_ready_date CHECK (status = 'draft' OR event_date IS NOT NULL),
    CONSTRAINT events_valid_times CHECK ((isfinite(event_date) AND ((end_date IS NULL) OR (isfinite(end_date) AND (end_date >= event_date)))))
);

COMMENT ON COLUMN public.events.public_id IS 'Stable public lookup ID: imported source ID, otherwise UUID text. Preserve existing event URLs.';

COMMENT ON COLUMN public.events.content_vi IS 'Full event-page HTML, including safe rich-text colour marks; not a short description.';

COMMENT ON COLUMN public.events.additional_fee IS 'Unformatted integer VND; NULL means unspecified. UI additionalFee maps here.';

COMMENT ON COLUMN public.events.is_deleted IS 'Soft deletion only. Excluded from public pages and normal admin lists.';

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    object_path text NOT NULL,
    original_filename text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    alt_vi text DEFAULT ''::text NOT NULL,
    alt_en text,
    source_url text,
    created_by uuid DEFAULT auth.uid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    provider text NOT NULL DEFAULT 'supabase' CHECK (provider IN ('supabase', 'r2')),
    ticket_palette_key text,
    ticket_palette_version integer NOT NULL DEFAULT 0 CHECK (ticket_palette_version >= 0),
    ticket_palette_hash text CHECK (ticket_palette_hash IS NULL OR ticket_palette_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT media_provider_bucket_path_unique UNIQUE (provider, bucket_id, object_path),
    CONSTRAINT media_provider_bucket CHECK (
        (provider = 'supabase' AND bucket_id IN ('lounge-drafts', 'lounge-public'))
        OR (provider = 'r2' AND btrim(bucket_id) <> '')
    ),
    CONSTRAINT media_assets_height_check CHECK ((height > 0)),
    CONSTRAINT media_assets_mime_type_check CHECK ((mime_type = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
    CONSTRAINT media_assets_object_path_check CHECK (((btrim(object_path) <> ''::text) AND (object_path !~ '(^/|(^|/)\.\.(/|$))'::text))),
    CONSTRAINT media_assets_original_filename_check CHECK ((btrim(original_filename) <> ''::text)),
    CONSTRAINT media_assets_size_bytes_check CHECK (((size_bytes >= 1) AND (size_bytes <= 10485760))),
    CONSTRAINT media_assets_width_check CHECK ((width > 0)),
    CONSTRAINT media_pixel_limit CHECK ((((width)::bigint * (height)::bigint) <= 40000000))
);

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name_vi text NOT NULL,
    name_en text,
    description_vi text,
    description_en text,
    price numeric(10,0) NOT NULL,
    is_sold_out boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference text DEFAULT ('BR-'::text || upper("left"(replace((gen_random_uuid())::text, '-'::text, ''::text), 12))) NOT NULL,
    idempotency_key uuid NOT NULL,
    event_id uuid,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    visit_date date NOT NULL,
    visit_time time without time zone NOT NULL,
    guests integer NOT NULL,
    notes text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    source text DEFAULT 'website'::text NOT NULL,
    phone_normalized text GENERATED ALWAYS AS (private.normalize_reservation_phone(phone)) STORED,
    CONSTRAINT reservations_email_check CHECK (((email IS NULL) OR ((char_length(email) <= 254) AND (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'::text)))),
    CONSTRAINT reservations_guests_check CHECK ((guests > 0)),
    CONSTRAINT reservations_name_check CHECK (((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 120))),
    CONSTRAINT reservations_notes_check CHECK ((char_length(notes) <= 1000)),
    CONSTRAINT reservations_phone_check CHECK (((phone ~ '^[+0-9 ().-]+$'::text) AND ((char_length(regexp_replace(phone, '[^0-9]'::text, ''::text, 'g'::text)) >= 7) AND (char_length(regexp_replace(phone, '[^0-9]'::text, ''::text, 'g'::text)) <= 15)))),
    CONSTRAINT reservations_source_check CHECK ((source = ANY (ARRAY['website'::text, 'facebook'::text, 'zalo'::text, 'phone'::text, 'other'::text]))),
    CONSTRAINT reservations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'declined'::text, 'cancelled'::text, 'unreachable'::text]))),
    CONSTRAINT reservations_visit_date_check CHECK (isfinite(visit_date)),
    CONSTRAINT reservations_visit_time_check CHECK (((visit_time >= '07:00:00'::time without time zone) AND (visit_time <= '23:00:00'::time without time zone)))
);

COMMENT ON TABLE public.reservations IS 'Private Vietnam-local booking inquiries. Pending means received, not confirmed. Only one pending inquiry per normalized phone.';

COMMENT ON COLUMN public.reservations.reference IS 'Guest/staff lookup code, not authorization or duplicate protection. New codes are BR- plus 12 uppercase hex characters.';

COMMENT ON COLUMN public.reservations.idempotency_key IS 'Stable retry token for one form submission, separate from the phone-based pending-request limit.';

COMMENT ON COLUMN public.reservations.visit_date IS 'Calendar date in Vietnam. Combine with visit_time using fixed Asia/Ho_Chi_Minh configuration.';

COMMENT ON COLUMN public.reservations.visit_time IS 'Local venue time, without time zone. Audit/creation timestamps remain timestamptz.';

COMMENT ON COLUMN public.reservations.phone_normalized IS 'Canonical digits; Vietnamese 0, +84 and 0084 prefixes resolve to the same phone. Never public.';

CREATE TABLE public.seating_settings (
    id text DEFAULT 'home'::text NOT NULL,
    lower_asset_id uuid,
    upper_asset_id uuid,
    is_visible boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    CONSTRAINT seating_settings_id_check CHECK ((id = 'home'::text)),
    CONSTRAINT visible_maps_required CHECK (((NOT is_visible) OR ((lower_asset_id IS NOT NULL) AND (upper_asset_id IS NOT NULL))))
);

CREATE TABLE public.staff_members (
    user_id uuid NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name text DEFAULT 'Nhân viên'::text NOT NULL,
    tokens_valid_after timestamp with time zone,
    CONSTRAINT staff_display_name_valid CHECK (((char_length(btrim(display_name)) >= 1) AND (char_length(btrim(display_name)) <= 120))),
    CONSTRAINT staff_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text])))
);

COMMENT ON COLUMN public.staff_members.display_name IS 'Staff-facing account display name, separate from authorization role and Auth email.';

CREATE TABLE public.video_settings (
    id text DEFAULT 'home'::text NOT NULL,
    source_url text NOT NULL,
    provider text NOT NULL,
    heading_vi text NOT NULL,
    heading_en text,
    is_visible boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    CONSTRAINT video_settings_heading_vi_check CHECK ((btrim(heading_vi) <> ''::text)),
    CONSTRAINT video_settings_id_check CHECK ((id = 'home'::text)),
    CONSTRAINT video_settings_provider_check CHECK ((provider = ANY (ARRAY['YouTube'::text, 'Facebook'::text, 'Vimeo'::text, 'Video'::text]))),
    CONSTRAINT video_settings_source_url_check CHECK ((source_url ~ '^https://[^/@]+/'::text))
);

COMMENT ON TABLE public.video_settings IS 'Homepage video URL/provider, VI/EN headings and visibility. Embed URL is derived, never trusted raw HTML.';

ALTER TABLE ONLY private.reservation_limits
    ADD CONSTRAINT reservation_limits_pkey PRIMARY KEY (bucket_key);

ALTER TABLE ONLY private.reservation_receipts
    ADD CONSTRAINT reservation_receipts_pkey PRIMARY KEY (idempotency_key);

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT content_audit_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_public_id_unique UNIQUE (public_id);

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_source_id_key UNIQUE (source_id);

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_idempotency_key_key UNIQUE (idempotency_key);

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_reference_key UNIQUE (reference);

ALTER TABLE ONLY public.seating_settings
    ADD CONSTRAINT seating_settings_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.video_settings
    ADD CONSTRAINT video_settings_pkey PRIMARY KEY (id);

CREATE INDEX reservation_limits_expiry_idx ON private.reservation_limits USING btree (window_end);

CREATE INDEX reservation_receipts_created_idx ON private.reservation_receipts USING btree (created_at);

CREATE INDEX articles_published_at_idx ON public.articles USING btree (published_at DESC);

CREATE INDEX audit_log_actor_idx ON public.audit_log USING btree (actor_id, created_at DESC);

CREATE INDEX audit_log_record_idx ON public.audit_log USING btree (table_name, record_id, created_at DESC, id DESC);

CREATE INDEX categories_sort_order_idx ON public.categories USING btree (sort_order);

CREATE INDEX events_cover_asset_idx ON public.events USING btree (cover_asset_id);

CREATE INDEX events_event_date_idx ON public.events USING btree (event_date);

CREATE INDEX events_not_deleted_date_idx ON public.events USING btree (event_date) WHERE (NOT is_deleted);

CREATE INDEX events_visible_upcoming_idx ON public.events USING btree (event_date) WHERE is_active;

CREATE INDEX menu_items_category_sort_idx ON public.menu_items USING btree (category_id, sort_order);

CREATE INDEX reservations_event_id_idx ON public.reservations USING btree (event_id);

CREATE UNIQUE INDEX reservations_one_pending_phone_idx ON public.reservations USING btree (phone_normalized) WHERE (status = 'pending'::text);

CREATE INDEX reservations_queue_idx ON public.reservations USING btree (status, created_at DESC);

CREATE TRIGGER articles_audit AFTER INSERT OR DELETE OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER categories_audit AFTER INSERT OR DELETE OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER events_audit AFTER INSERT OR DELETE OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER events_validate_cover BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION private.validate_event_cover();

CREATE TRIGGER media_assets_audit AFTER INSERT OR DELETE OR UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER media_assets_updated BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER menu_items_audit AFTER INSERT OR DELETE OR UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER menu_items_set_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reservations_audit AFTER INSERT OR DELETE OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER reservations_lifecycle BEFORE INSERT OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION private.validate_reservation_lifecycle();

CREATE TRIGGER reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER seating_settings_audit AFTER INSERT OR DELETE OR UPDATE ON public.seating_settings FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER seating_updated BEFORE UPDATE ON public.seating_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER seating_validate BEFORE INSERT OR UPDATE ON public.seating_settings FOR EACH ROW EXECUTE FUNCTION private.validate_seating_assets();

CREATE TRIGGER staff_members_audit AFTER INSERT OR DELETE OR UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER staff_members_updated BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER video_settings_audit AFTER INSERT OR DELETE OR UPDATE ON public.video_settings FOR EACH ROW EXECUTE FUNCTION private.audit_application_change();

CREATE TRIGGER video_settings_updated BEFORE UPDATE ON public.video_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE ONLY private.reservation_receipts
    ADD CONSTRAINT reservation_receipts_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT content_audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_cover_asset_id_fkey FOREIGN KEY (cover_asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.seating_settings
    ADD CONSTRAINT seating_settings_lower_asset_id_fkey FOREIGN KEY (lower_asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.seating_settings
    ADD CONSTRAINT seating_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.seating_settings
    ADD CONSTRAINT seating_settings_upper_asset_id_fkey FOREIGN KEY (upper_asset_id) REFERENCES public.media_assets(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.staff_members
    ADD CONSTRAINT staff_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.video_settings
    ADD CONSTRAINT video_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE private.reservation_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE private.reservation_receipts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY articles_public_read ON public.articles FOR SELECT USING ((status = 'ready' AND (published_at IS NOT NULL) AND (published_at <= now())));

CREATE POLICY articles_staff_manage ON public.articles TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_staff_read ON public.audit_log FOR SELECT TO authenticated USING ((( SELECT private.has_staff_role(ARRAY['admin'::text]) AS has_staff_role) OR ((table_name = 'reservations'::text) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text, 'booking'::text]) AS has_staff_role))));

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_public_read ON public.categories FOR SELECT USING (true);

CREATE POLICY categories_staff_manage ON public.categories TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_public_read ON public.events FOR SELECT TO anon, authenticated USING ((status = 'ready' AND is_active AND (NOT is_deleted)));

CREATE POLICY events_staff_insert ON public.events FOR INSERT TO authenticated WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

CREATE POLICY events_staff_read ON public.events FOR SELECT TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

CREATE POLICY events_staff_update ON public.events FOR UPDATE TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_public_metadata ON public.media_assets FOR SELECT TO anon, authenticated USING (provider = 'supabase' AND bucket_id = 'lounge-public');

CREATE POLICY media_staff_manage ON public.media_assets TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY menu_items_public_read ON public.menu_items FOR SELECT USING (true);

CREATE POLICY menu_items_staff_manage ON public.menu_items TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY reservations_staff_insert ON public.reservations FOR INSERT TO authenticated WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text, 'booking'::text]) AS has_staff_role));

CREATE POLICY reservations_staff_read ON public.reservations FOR SELECT TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text, 'booking'::text]) AS has_staff_role));

CREATE POLICY reservations_staff_update ON public.reservations FOR UPDATE TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text, 'booking'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text, 'booking'::text]) AS has_staff_role));

CREATE POLICY seating_public_read ON public.seating_settings FOR SELECT TO anon USING (is_visible);

ALTER TABLE public.seating_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY seating_staff_read ON public.seating_settings FOR SELECT TO authenticated USING ((is_visible OR ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)));

CREATE POLICY seating_staff_update ON public.seating_settings FOR UPDATE TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

CREATE POLICY staff_admin_manage ON public.staff_members TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text]) AS has_staff_role));

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_read_self_or_admin ON public.staff_members FOR SELECT TO authenticated USING (((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.has_staff_role(ARRAY['admin'::text]) AS has_staff_role)));

CREATE POLICY video_public_read ON public.video_settings FOR SELECT TO anon, authenticated USING (is_visible);

ALTER TABLE public.video_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY video_staff_manage ON public.video_settings TO authenticated USING (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)) WITH CHECK (( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role));

GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public,private FROM anon,authenticated;

REVOKE ALL ON FUNCTION private.audit_application_change() FROM PUBLIC;

REVOKE ALL ON FUNCTION private.consume_reservation_limit(bucket text, maximum integer, duration interval) FROM PUBLIC;

REVOKE ALL ON FUNCTION private.has_staff_role(allowed_roles text[]) FROM PUBLIC;
GRANT ALL ON FUNCTION private.has_staff_role(allowed_roles text[]) TO authenticated;

REVOKE ALL ON FUNCTION private.normalize_reservation_phone(value text) FROM PUBLIC;
GRANT ALL ON FUNCTION private.normalize_reservation_phone(value text) TO authenticated;
GRANT ALL ON FUNCTION private.normalize_reservation_phone(value text) TO service_role;

REVOKE ALL ON FUNCTION private.validate_event_cover() FROM PUBLIC;

REVOKE ALL ON FUNCTION private.validate_reservation_lifecycle() FROM PUBLIC;

REVOKE ALL ON FUNCTION private.validate_seating_assets() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.admin_staff_directory(p_search text, p_status text, p_page integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.admin_staff_directory(p_search text, p_status text, p_page integer) TO authenticated;

REVOKE ALL ON FUNCTION public.finish_staff_security_action(p_target uuid, p_actor uuid, p_action text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.finish_staff_security_action(p_target uuid, p_actor uuid, p_action text) TO service_role;

REVOKE ALL ON FUNCTION public.staff_access_allowed() FROM PUBLIC;
GRANT ALL ON FUNCTION public.staff_access_allowed() TO authenticated;

REVOKE ALL ON FUNCTION public.submit_reservation_request(p_key uuid, p_fingerprint text, p_ip_hash text, p_phone_hash text, p_shared_ip boolean, p_event_id uuid, p_name text, p_phone text, p_email text, p_visit_date date, p_visit_time time without time zone, p_guests integer, p_notes text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.submit_reservation_request(p_key uuid, p_fingerprint text, p_ip_hash text, p_phone_hash text, p_shared_ip boolean, p_event_id uuid, p_name text, p_phone text, p_email text, p_visit_date date, p_visit_time time without time zone, p_guests integer, p_notes text) TO service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA public,private FROM anon,authenticated,service_role;

GRANT SELECT ON TABLE public.articles TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.articles TO authenticated;
GRANT ALL ON TABLE public.articles TO service_role;

GRANT ALL ON TABLE public.audit_log TO service_role;
GRANT SELECT ON TABLE public.audit_log TO authenticated;

GRANT ALL ON SEQUENCE public.audit_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.audit_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.audit_log_id_seq TO service_role;

GRANT SELECT ON TABLE public.categories TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;

GRANT SELECT ON TABLE public.events TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;

GRANT ALL ON TABLE public.media_assets TO service_role;
GRANT SELECT ON TABLE public.media_assets TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.media_assets TO authenticated;

GRANT SELECT ON TABLE public.menu_items TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.menu_items TO authenticated;
GRANT ALL ON TABLE public.menu_items TO service_role;

GRANT ALL ON TABLE public.reservations TO service_role;
GRANT SELECT,INSERT ON TABLE public.reservations TO authenticated;

GRANT UPDATE(event_id) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(name) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(phone) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(email) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(visit_date) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(visit_time) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(guests) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(notes) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(status) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(updated_by) ON TABLE public.reservations TO authenticated;

GRANT UPDATE(source) ON TABLE public.reservations TO authenticated;

GRANT ALL ON TABLE public.seating_settings TO service_role;
GRANT SELECT ON TABLE public.seating_settings TO anon;
GRANT SELECT ON TABLE public.seating_settings TO authenticated;

GRANT UPDATE(lower_asset_id) ON TABLE public.seating_settings TO authenticated;

GRANT UPDATE(upper_asset_id) ON TABLE public.seating_settings TO authenticated;

GRANT UPDATE(is_visible) ON TABLE public.seating_settings TO authenticated;

GRANT UPDATE(updated_at) ON TABLE public.seating_settings TO authenticated;

GRANT UPDATE(updated_by) ON TABLE public.seating_settings TO authenticated;

GRANT ALL ON TABLE public.staff_members TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.staff_members TO authenticated;

GRANT ALL ON TABLE public.video_settings TO service_role;
GRANT SELECT ON TABLE public.video_settings TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.video_settings TO authenticated;

-- Policies on the Supabase-managed storage table.
CREATE POLICY "lounge_media_staff_delete" ON storage.objects AS PERMISSIVE FOR DELETE TO "authenticated" USING (((bucket_id = ANY (ARRAY['lounge-drafts'::text, 'lounge-public'::text])) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role) AND (NOT (EXISTS ( SELECT 1
   FROM (public.events e
     JOIN public.media_assets m ON ((m.id = e.cover_asset_id)))
  WHERE ((m.bucket_id = objects.bucket_id) AND (m.object_path = objects.name)))))));
CREATE POLICY "lounge_media_staff_insert" ON storage.objects AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((bucket_id = ANY (ARRAY['lounge-drafts'::text, 'lounge-public'::text])) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)));
CREATE POLICY "lounge_media_staff_read" ON storage.objects AS PERMISSIVE FOR SELECT TO "authenticated" USING (((bucket_id = ANY (ARRAY['lounge-drafts'::text, 'lounge-public'::text])) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)));
CREATE POLICY "lounge_media_staff_update" ON storage.objects AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((bucket_id = ANY (ARRAY['lounge-drafts'::text, 'lounge-public'::text])) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role))) WITH CHECK (((bucket_id = ANY (ARRAY['lounge-drafts'::text, 'lounge-public'::text])) AND ( SELECT private.has_staff_role(ARRAY['admin'::text, 'editor'::text]) AS has_staff_role)));

-- Publish only staff-protected booking rows; RLS still authorizes subscribers.
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.reservations;
SET check_function_bodies = true;
SET row_security = on;
RESET search_path;

-- Cache analysis by immutable cover bytes; public cards read the event key directly.
create or replace function private.sync_event_ticket_palette() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' or new.cover_asset_id is distinct from old.cover_asset_id or new.cover_image_url is distinct from old.cover_image_url then
  new.ticket_palette_key := (select ticket_palette_key from public.media_assets where id=new.cover_asset_id);
 end if;
 return new;
end; $$;
revoke all on function private.sync_event_ticket_palette() from public,anon,authenticated;
create trigger events_ticket_palette before insert or update on public.events
for each row execute function private.sync_event_ticket_palette();
comment on column public.events.ticket_palette_key is 'Server-generated static Tailwind palette key from the current cover; no public image analysis required.';

-- Keep the generated colour for Reset; an editor may choose another safe palette.
comment on column public.events.ticket_palette_override is 'Optional editor-selected static ticket palette key. NULL uses the detected cover palette.';

-- Permanent event deletion with durable, private storage-cleanup jobs.
create table public.media_deletion_jobs (
 id uuid primary key default gen_random_uuid(),
 provider text not null check(provider in ('r2','supabase')),
 bucket_id text not null,
 object_path text not null,
 created_at timestamptz not null default now(),
 claim_token uuid,
 lease_until timestamptz,
 unique(provider,bucket_id,object_path)
);
alter table public.media_deletion_jobs enable row level security;
revoke all on public.media_deletion_jobs from public,anon,authenticated;
grant all on public.media_deletion_jobs to service_role;

-- A content-addressed path must not be resurrected while its deletion is pending.
create function private.guard_media_pending_deletion() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.media_deletion_jobs j where j.provider=new.provider and j.bucket_id=new.bucket_id and j.object_path=new.object_path) then
  raise exception 'Media cleanup pending. Retry upload shortly.' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function private.guard_media_pending_deletion() from public;
create trigger media_pending_deletion before insert or update on public.media_assets for each row execute function private.guard_media_pending_deletion();

create function public.delete_event_permanently(p_event_id uuid,p_expected_updated_at timestamptz)
returns text language plpgsql security definer set search_path='' as $$
declare old_event public.events; asset public.media_assets;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege; end if;
 -- Serialize live references and media claims until the cleanup jobs are committed.
 lock table public.events,public.articles,public.seating_settings,public.video_settings,public.media_assets in share row exclusive mode;
 select * into old_event from public.events where id=p_event_id for update;
 if not found then raise exception 'Event not found' using errcode='P0002'; end if;
 if old_event.updated_at is distinct from p_expected_updated_at then raise exception 'Event changed' using errcode='40001'; end if;
 if exists(select 1 from public.reservations where event_id=p_event_id) then raise exception 'Event has reservations' using errcode='23503'; end if;
 delete from public.events where id=p_event_id;
 for asset in select m.* from public.media_assets m
 where m.id=old_event.cover_asset_id or strpos(to_jsonb(old_event)::text,m.object_path)>0
 loop
  -- Article images can be reused through URLs without a foreign key.
  if not exists(select 1 from public.events e where e.cover_asset_id=asset.id or strpos(to_jsonb(e)::text,asset.object_path)>0)
   and not exists(select 1 from public.articles a where strpos(to_jsonb(a)::text,asset.object_path)>0)
   and not exists(select 1 from public.seating_settings s where s.lower_asset_id=asset.id or s.upper_asset_id=asset.id or strpos(to_jsonb(s)::text,asset.object_path)>0)
   and not exists(select 1 from public.video_settings v where strpos(to_jsonb(v)::text,asset.object_path)>0)
  then
   insert into public.media_deletion_jobs(provider,bucket_id,object_path)values(asset.provider,asset.bucket_id,asset.object_path)on conflict do nothing;
   delete from public.media_assets where id=asset.id;
  end if;
 end loop;
 return old_event.public_id;
end $$;
revoke all on function public.delete_event_permanently(uuid,timestamptz) from public,anon;
grant execute on function public.delete_event_permanently(uuid,timestamptz) to authenticated;

create function public.claim_media_deletion_jobs(p_token uuid)
returns setof public.media_deletion_jobs language sql security definer set search_path='' as $$
 update public.media_deletion_jobs set claim_token=p_token,lease_until=now()+interval '10 minutes'
 where id in(select id from public.media_deletion_jobs where lease_until is null or lease_until<now() order by created_at limit 20 for update skip locked)
 returning *;
$$;
revoke all on function public.claim_media_deletion_jobs(uuid) from public,anon,authenticated;
grant execute on function public.claim_media_deletion_jobs(uuid) to service_role;

CREATE OR REPLACE FUNCTION private.audit_application_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare before_row jsonb; after_row jsonb; old_snapshot jsonb; new_snapshot jsonb; fields text[]; entity text;
begin
 before_row:=case when tg_op='INSERT' then null else to_jsonb(old) end;
 after_row:=case when tg_op='DELETE' then null else to_jsonb(new) end;
 entity:=coalesce(after_row->>'id',after_row->>'user_id',before_row->>'id',before_row->>'user_id');
 select coalesce(array_agg(key order by key),array[]::text[]) into fields
 from (select key from jsonb_object_keys(coalesce(before_row,'{}'::jsonb)||coalesce(after_row,'{}'::jsonb)) as keys(key)
 where key not in ('created_at','updated_at','updated_by') and before_row->key is distinct from after_row->key) changed;
 if tg_op='UPDATE' and cardinality(fields)=0 then return new; end if;
 old_snapshot:=before_row;new_snapshot:=after_row;
 if tg_table_name='reservations' then
  -- Contact details stay in reservations; do not duplicate them in history snapshots.
  select jsonb_object_agg(key,value) into old_snapshot from jsonb_each(coalesce(before_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
  select jsonb_object_agg(key,value) into new_snapshot from jsonb_each(coalesce(after_row,'{}'::jsonb))
   where key=any(array['id','reference','event_id','visit_date','visit_time','guests','status','source']);
 end if;
 if tg_table_name='events' and tg_op='DELETE' then
  old_snapshot:=jsonb_build_object('id',old.id,'title_vi',old.title_vi,'event_date',old.event_date);
 end if;
 insert into public.audit_log(table_name,record_id,operation,actor_id,old_data,new_data,action,actor_type,changed_fields)
 values(tg_table_name,entity,tg_op,auth.uid(),old_snapshot,new_snapshot,
 tg_table_name||'.'||case when tg_op='UPDATE' and tg_table_name='reservations' and before_row->'status' is distinct from after_row->'status' then 'status_changed' else lower(tg_op) end,
 case when auth.uid() is not null then 'staff' when tg_op='INSERT' and tg_table_name='reservations' and after_row->>'source'='website' then 'guest' else 'system' end,fields);
 if tg_op='DELETE' then return old; end if;return new;
end $$;


-- Scoped upload ownership and transactional content writes.
create table public.media_upload_claims(session_id uuid not null,asset_id uuid not null references public.media_assets(id) on delete restrict,created_by uuid not null default auth.uid() references auth.users(id),created_at timestamptz not null default now(),primary key(session_id,asset_id,created_by));
alter table public.media_upload_claims enable row level security;
revoke all on public.media_upload_claims from public,anon,authenticated;
grant all on public.media_upload_claims to service_role;

create function private.serialize_content_media() returns trigger language plpgsql set search_path='' as $$begin perform pg_advisory_xact_lock(741329106);return null;end $$;
revoke all on function private.serialize_content_media() from public;
create trigger serialize_events before insert or update or delete on public.events for each statement execute function private.serialize_content_media();
create trigger serialize_articles before insert or update or delete on public.articles for each statement execute function private.serialize_content_media();
create trigger serialize_seating before insert or update or delete on public.seating_settings for each statement execute function private.serialize_content_media();
create trigger serialize_media before insert or update or delete on public.media_assets for each statement execute function private.serialize_content_media();
create trigger serialize_claims before insert or update or delete on public.media_upload_claims for each statement execute function private.serialize_content_media();

create function private.media_candidates(document jsonb) returns uuid[] language sql security definer set search_path='' as $$
 select coalesce(array_agg(m.id),array[]::uuid[]) from public.media_assets m where strpos(coalesce(document::text,''),m.object_path)>0 or strpos(coalesce(document::text,''),m.id::text)>0;
$$;
create function private.queue_unused_media(candidates uuid[]) returns void language plpgsql security definer set search_path='' as $$
declare asset public.media_assets;
begin
 perform pg_advisory_xact_lock(741329106);
 for asset in select * from public.media_assets where id=any(candidates) for update loop
 if not exists(select 1 from public.events e where e.cover_asset_id=asset.id or strpos(to_jsonb(e)::text,asset.object_path)>0)
 and not exists(select 1 from public.articles a where strpos(to_jsonb(a)::text,asset.object_path)>0)
 and not exists(select 1 from public.seating_settings s where s.lower_asset_id=asset.id or s.upper_asset_id=asset.id or strpos(to_jsonb(s)::text,asset.object_path)>0)
 and not exists(select 1 from public.video_settings v where strpos(to_jsonb(v)::text,asset.object_path)>0)
 and not exists(select 1 from public.media_upload_claims c where c.asset_id=asset.id)
 then
 insert into public.media_deletion_jobs(provider,bucket_id,object_path)values(asset.provider,asset.bucket_id,asset.object_path)on conflict do nothing;
 delete from public.media_assets where id=asset.id;
 end if;
 end loop;
end $$;
revoke all on function private.media_candidates(jsonb),private.queue_unused_media(uuid[]) from public;
create function private.cleanup_replaced_media() returns trigger language plpgsql security definer set search_path='' as $$
begin perform private.queue_unused_media(private.media_candidates(to_jsonb(old)));return null;end $$;
revoke all on function private.cleanup_replaced_media() from public;
create trigger events_cleanup after update or delete on public.events for each row execute function private.cleanup_replaced_media();
create trigger articles_cleanup after update or delete on public.articles for each row execute function private.cleanup_replaced_media();
create trigger seating_cleanup after update on public.seating_settings for each row execute function private.cleanup_replaced_media();

create function public.claim_media_upload(p_session uuid,p_asset uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 perform 1 from public.media_assets where id=p_asset for update;if not found then raise exception 'Media no longer exists' using errcode='23503';end if;
 insert into public.media_upload_claims(session_id,asset_id,created_by)values(p_session,p_asset,auth.uid())on conflict do nothing;
end $$;
create function public.release_media_session(p_session uuid) returns void language plpgsql security definer set search_path='' as $$
declare candidates uuid[];
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 select array_agg(asset_id) into candidates from public.media_upload_claims where session_id=p_session and created_by=auth.uid();
 delete from public.media_upload_claims where session_id=p_session and created_by=auth.uid();
 perform private.queue_unused_media(coalesce(candidates,array[]::uuid[]));
end $$;
create function public.commit_content(p_kind text,p_id uuid,p_data jsonb,p_expected timestamptz,p_status text,p_session uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev public.events; ar public.articles; saved jsonb;
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 if p_status not in ('draft','ready') or p_status is null then
  raise exception 'Invalid content status' using errcode='23514';
 end if;
 if p_kind='event' then
 if p_id is not null then
 select * into ev from public.events where id=p_id and updated_at=p_expected and (p_status='ready' or status='draft') for update;
 if not found then raise exception 'Event changed' using errcode='40001';end if;
 end if;
 ev:=jsonb_populate_record(ev,p_data);
 if p_id is null then
 insert into public.events(id,status,title_vi,title_en,performer_name,event_date,end_date,content_vi,content_en,cover_asset_id,cover_image_url,is_active,additional_fee,ticket_palette_override,source_id,source_url,created_by,updated_by)
 values(gen_random_uuid(),p_status,coalesce(ev.title_vi,''),ev.title_en,coalesce(ev.performer_name,''),ev.event_date,ev.end_date,coalesce(ev.content_vi,''),ev.content_en,ev.cover_asset_id,ev.cover_image_url,coalesce(ev.is_active,true),coalesce(ev.additional_fee,0),ev.ticket_palette_override,ev.source_id,ev.source_url,auth.uid(),auth.uid())returning to_jsonb(events.*)into saved;
 else
 update public.events set status=p_status,title_vi=coalesce(ev.title_vi,''),title_en=ev.title_en,performer_name=coalesce(ev.performer_name,''),event_date=ev.event_date,end_date=ev.end_date,content_vi=coalesce(ev.content_vi,''),content_en=ev.content_en,cover_asset_id=ev.cover_asset_id,cover_image_url=ev.cover_image_url,is_active=coalesce(ev.is_active,true),additional_fee=ev.additional_fee,ticket_palette_override=ev.ticket_palette_override,source_url=ev.source_url,updated_by=auth.uid()where id=p_id returning to_jsonb(events.*)into saved;
 end if;
 elsif p_kind='article' then
 if p_id is not null then select * into ar from public.articles where id=p_id and updated_at=p_expected and (p_status='ready' or status='draft') for update;if not found then raise exception 'Article changed' using errcode='40001';end if;end if;
 ar:=jsonb_populate_record(ar,p_data);
 if p_id is null then insert into public.articles(id,status,title_vi,title_en,slug,content_vi,content_en,thumbnail_url,published_at)values(gen_random_uuid(),p_status,coalesce(ar.title_vi,''),ar.title_en,nullif(ar.slug,''),coalesce(ar.content_vi,''),ar.content_en,ar.thumbnail_url,ar.published_at)returning to_jsonb(articles.*)into saved;
 else update public.articles set status=p_status,title_vi=coalesce(ar.title_vi,''),title_en=ar.title_en,slug=nullif(ar.slug,''),content_vi=coalesce(ar.content_vi,''),content_en=ar.content_en,thumbnail_url=ar.thumbnail_url,published_at=ar.published_at where id=p_id returning to_jsonb(articles.*)into saved;end if;
 else raise exception 'Invalid content kind' using errcode='23514';end if;
 if p_session is not null then perform public.release_media_session(p_session);end if;
 return saved || jsonb_build_object('is_draft',p_status='draft');
end $$;

create function public.delete_content_draft(p_kind text,p_id uuid,p_expected timestamptz,p_session uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.has_staff_role(array['admin','editor']) then raise insufficient_privilege; end if;
 perform pg_advisory_xact_lock(741329106);
 if p_kind='event' then
  delete from public.events where id=p_id and status='draft' and updated_at=p_expected;
 elsif p_kind='article' then
  delete from public.articles where id=p_id and status='draft' and updated_at=p_expected;
 else raise check_violation using message='Invalid content kind'; end if;
 if not found then raise serialization_failure using message='Draft changed'; end if;
 if p_session is not null then perform public.release_media_session(p_session); end if;
end $$;
revoke all on function public.claim_media_upload(uuid,uuid),public.release_media_session(uuid),public.delete_content_draft(text,uuid,timestamptz,uuid),public.commit_content(text,uuid,jsonb,timestamptz,text,uuid) from public,anon;
grant execute on function public.claim_media_upload(uuid,uuid),public.release_media_session(uuid),public.delete_content_draft(text,uuid,timestamptz,uuid),public.commit_content(text,uuid,jsonb,timestamptz,text,uuid) to authenticated;
create or replace function public.delete_event_permanently(p_event_id uuid,p_expected_updated_at timestamptz) returns text language plpgsql security definer set search_path='' as $$
declare old_event public.events;
begin
 if not private.has_staff_role(array['admin','editor'])then raise insufficient_privilege;end if;
 perform pg_advisory_xact_lock(741329106);
 select * into old_event from public.events where id=p_event_id for update;
 if not found then raise exception 'Event not found'using errcode='P0002';end if;
 if old_event.updated_at is distinct from p_expected_updated_at then raise exception 'Event changed'using errcode='40001';end if;
 if exists(select 1 from public.reservations where event_id=p_event_id)then raise exception 'Event has reservations'using errcode='23503';end if;
 delete from public.events where id=p_event_id;
 return old_event.public_id;
end $$;

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

-- Admin summaries omit large rich-text bodies.
create view public.admin_event_summaries with(security_invoker=true) as
 select id,title_vi,title_en,performer_name,coalesce(event_date::text,'') event_date,end_date::text,cover_image_url,cover_asset_id::text,
 is_active,coalesce(additional_fee,0) additional_fee,is_deleted,updated_at,(status='draft') is_draft
 from public.events where not is_deleted;
create view public.admin_article_summaries with(security_invoker=true) as
 select id,title_vi,title_en,coalesce(slug,'') slug,thumbnail_url,published_at::text,updated_at,(status='draft') is_draft
 from public.articles;
revoke all on public.admin_event_summaries,public.admin_article_summaries from public,anon;
grant select on public.admin_event_summaries,public.admin_article_summaries to authenticated;

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
