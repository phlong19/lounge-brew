# Supabase persistence contract

Deployed 30 October 2026 to `brew` (`zcftrbvrfiypqtwhmxxj`). This document covers every editable field in the current event/video admin, the booking form, uploads and staff access. Fixed front-office sections continue to use their existing local snapshots; this migration does not claim to turn those sections into CMS editors.

## Event editor → `public.events`

| Editor value | Database field | Contract |
| --- | --- | --- |
| Record ID | `id` | UUID primary key |
| Imported source ID / existing public URL | `source_id`, generated `public_id` | Preserve numeric source links; new records use UUID text |
| Vietnamese programme name | `title_vi` | Required, nonblank text |
| English programme name | `title_en` | Optional text; public-language fallback remains an application rule |
| Artist | `performer_name` | Required, nonblank text |
| Start / end | `event_date`, `end_date` | `timestamptz`; finite times; end cannot precede start; display in Hanoi time |
| Full page body | `content_vi`, `content_en` | Rich-text HTML; editor and safe renderer own markup/colour validation; no separate short-description field is required |
| Browser `File` / poster preview | `cover_asset_id` → `media_assets`, legacy `cover_image_url` | Resolve upload to a stable storage path before saving; never store `File`, blob URLs or expiring signed URLs |
| UI `additionalFee` | `additional_fee` | Nullable `bigint`, 0–9007199254740991; unformatted integer VND; NULL is unspecified and differs from zero |
| Website visibility | `is_active` | Visibility only; unrelated to whether a performance is currently taking place |
| Provenance | `source_url` | Optional HTTPS source reference |
| Ownership / timestamps | `created_by`, `updated_by`, `created_at`, `updated_at` | Auth-user references and timestamps; audit actor is recorded separately |

The original `description_vi` / `description_en` columns remain for compatibility. The new editor writes full page content instead. The homepage's four nearest future visible events and booking eligibility are derived from start time and visibility, so there are no manual homepage or reservation-allow flags to persist.

## Video editor → `public.video_settings`

Singleton `id = 'home'`: `source_url`, `provider` (YouTube/Facebook/Vimeo/Video), `heading_vi`, `heading_en`, `is_visible`, `updated_by`, `created_at`, `updated_at`. Embed URLs and accessible player titles are derived from the validated URL/headings, not a second independently editable title or arbitrary iframe HTML. URL/provider consistency must also be validated by the existing parser in server mutations.

## Media → Storage + `public.media_assets`

Two image buckets: private `lounge-drafts` and public `lounge-public`. Both restrict MIME types to JPG/PNG/WebP and size to 10 MiB. Metadata includes bucket, object path, original filename, MIME type, size, width/height, VI/EN alt text, source URL, creator and timestamps. Dimensions are positive and capped at 40 million pixels. Visible events cannot reference a draft poster asset. Required-poster checks accept preserved legacy poster URLs while new uploads use asset records. Referenced assets cannot be deleted through the normal storage policy.

The HTML body can reference inline images; future upload actions should also register these in media metadata. The rich-text colour exception stays limited to validated hex colours in the editor/renderer; no executable content or arbitrary CSS is authorized by storing HTML.

## Booking form → `public.reservations`

Every current form value has storage: optional `event_id`, `name`, `phone`, optional `email`, `visit_date`, `visit_time`, fixed `venue_timezone`, positive integer `guests`, and `notes`. Internal fields: UUID `id`, unique `reference`, required unique `idempotency_key`, `status`, optional `assigned_to`, `updated_by`, and timestamps. Status starts at `new` (receipt, not confirmation). `reservation_activity` records status transitions and actor/time without duplicating all contact details.

The future booking endpoint must recheck event visibility/start time, validate the full payload, enforce spam controls and submit a stable idempotency key. There is deliberately no anonymous insert policy or public read access to booking contacts.

## Access and audit

`staff_members` links to Supabase Auth users and grants explicit active roles: `admin`, `editor`, `booking`. Ordinary sign-in grants no content-write or reservation-read capability. Administrators manage staff; editors manage content/media; booking staff handle private requests. `content_audit_log` records event/video changes. All ten application tables use RLS. Login email/password belong to Supabase Auth, never public content tables. No user is automatically promoted to staff.

## Migration and verification

- Keep `0001_initial_schema.sql`; apply `20261030000000_admin_persistence.sql` afterward. The new migration removes the scaffold's permissive authenticated-write policies without dropping legacy data.
- Initial remote deployment applied both exact files atomically using the Management SQL API and recorded matching `version`, `name`, and `statements` in `supabase_migrations.schema_migrations`. Future CLI migration checks can match these local versions.
- `supabase/tests/schema_contract.sql` runs inside a rolled-back transaction. It checks required posters, integer fees, valid times, source IDs, duplicate-request protection, audits, anonymous/ordinary/editor/booking/admin permissions and private-data isolation. Test fixtures must never be committed.
- `src/types/database.ts` is generated from the deployed public schema, not hand-authored guesses.

## Not activated by a schema push

The `/admin-preview` screen is still a session-only design preview. This change does not enable live CRUD, publish media, seed content, create staff accounts, enable booking submission or send notifications. Next integration work must add server-side staff checks, upload/persistence adapters (including `additionalFee` → `additional_fee` and source-ID mapping), session refresh and cache invalidation. The configured environment uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, while the old Supabase client still looks for `NEXT_PUBLIC_SUPABASE_ANON_KEY`; reconcile that during connection wiring and seed/verify content before switching public reads.
