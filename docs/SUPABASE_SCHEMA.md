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
| UI `additionalFee` | `additional_fee` | `bigint`, 0–9007199254740991; unformatted integer VND; defaults to 0. Existing NULL fees were set to 0 by the staff-security migration; legacy nullable inputs render/save as 0. |
| Website visibility | `is_active` | Visibility only; unrelated to whether a performance is currently taking place |
| Provenance | `source_url` | Optional HTTPS source reference |
| Ownership / timestamps | `created_by`, `updated_by`, `created_at`, `updated_at` | Auth-user references and timestamps; audit actor is recorded separately |

The original `description_vi` / `description_en` columns remain for compatibility. The new editor writes full page content instead. The homepage's nearest future visible events and booking eligibility are derived from start time and visibility, so there are no manual homepage or reservation-allow flags to persist.

## Video editor → `public.video_settings`

Singleton `id = 'home'`: `source_url`, `provider` (YouTube/Facebook/Vimeo/Video), `heading_vi`, `heading_en`, `is_visible`, `updated_by`, `created_at`, `updated_at`. Embed URLs and accessible player titles are derived from the validated URL/headings, not a second independently editable title or arbitrary iframe HTML. URL/provider consistency must also be validated by the existing parser in server mutations.

## Media → Storage + `public.media_assets`

Two image buckets: private `lounge-drafts` and public `lounge-public`. Both restrict MIME types to JPG/PNG/WebP and size to 10 MiB. Metadata includes bucket, object path, original filename, MIME type, size, width/height, VI/EN alt text, source URL, creator and timestamps. Dimensions are positive and capped at 40 million pixels. Visible events cannot reference a draft poster asset. Required-poster checks accept preserved legacy poster URLs while new uploads use asset records. Referenced assets cannot be deleted through the normal storage policy.

The HTML body can reference inline images; future upload actions should also register these in media metadata. The rich-text colour exception stays limited to validated hex colours in the editor/renderer; no executable content or arbitrary CSS is authorized by storing HTML.

## Booking form → `public.reservations`

Updated 1 November 2026 by `20261101000000_reservation_foundation.sql`.

Form storage: optional `event_id`, `name`, `phone`, optional `email`, `visit_date` (`date`), `visit_time` (`time without time zone`), positive integer `guests`, and `notes`. Venue-local input always means Asia/Ho_Chi_Minh in application configuration. There is no per-record `venue_timezone` or `assigned_to` column. Creation/update/audit instants remain `timestamptz`.

Internal fields: UUID `id`, unique readable `reference` (new records use `BR-` plus 12 uppercase hex characters), unique `idempotency_key`, generated `phone_normalized`, `source`, `status`, `updated_by`, and timestamps. Reference is a lookup label, not permission to read private information; the idempotency key prevents replaying one submission. A separate unique partial index allows only one `pending` request per normalized phone. Local `0…`, `+84…`, and `0084…` variants share a canonical value. Historical confirmed/closed requests do not block a returning guest.

Statuses are `pending`, `confirmed`, `declined`, `cancelled`, `unreachable`. `pending` is receipt only, never a seat confirmation. Legacy `new` and `contacted` statuses migrate to `pending` and history is retained. Supported sources are `website`, `facebook`, `zalo`, `phone`, `other`; social/telephone requests use the staff manual-entry drawer.

Migration `20261101010000_reservation_workflow.sql` activates the service-only atomic submission RPC, private receipt/rate-limit tables, lifecycle guards and staff-authenticated Realtime publication. The guest endpoint and staff queue are implemented; see `docs/reservation-flow.md`. There is still no public read access or anonymous database insert policy for reservation contacts.

## Access and shared audit

`staff_members` grants active roles. Active admin/editor staff can handle the booking queue. The legacy booking-only role is retired; the two-role constraint matches the current staff form. Ordinary signed-in users cannot read requests. Inactive staff lose access. Existing admin/editor content authorization is unchanged.

One application-owned `audit_log` now stores content, media, seating, staff and reservation changes. It preserves the previous content audit IDs/payloads and imports any old reservation activity. Each row includes entity table/record, action/operation, actor/type, time, changed field names, old/new snapshots and metadata. All nine business tables use the shared trigger. Contact names, phone numbers, emails, notes and idempotency keys are excluded from reservation snapshots. Staff can read reservation history; only admins can read the other application history. Browser clients cannot insert, update or delete audit rows. Supabase's platform-managed Auth logs remain provider-owned; password/account actions add a redacted application audit event after success, never a password/hash/key.

Privileged Auth operations use the server-only `SUPABASE_SECRET_KEY` (`sb_secret_…`) client. Authenticated database writes continue to use the user's session and RLS so audit actors remain correct. The Postgres role is still named `service_role`; SQL grants to that role are not legacy API-key usage.

## Migration and verification

- Fresh projects apply only `20261102010000_app_baseline.sql` and `20261102010100_app_initialization.sql`. Existing projects must reconcile migration history instead of replaying baseline DDL; see `supabase/README.md`.
- The existing project now records the two baseline versions in `supabase_migrations.schema_migrations`. Historical migration references below describe development history and are archived under `supabase/history/pre-baseline-20261102`; they are not current deployment instructions.
- `supabase/tests/schema_contract.sql` runs inside a rolled-back transaction. It checks required posters, integer fees, valid times, source IDs, duplicate-request protection, audits, anonymous/ordinary/active-editor/inactive-editor/admin permissions and private-data isolation. Test fixture rows must never persist in the live database; SQL fixture definitions are versioned.
- `src/types/database.ts` is generated from the deployed public schema, not hand-authored guesses.

## Current integration state

Live event CRUD/media uploads, shared seating settings, staff creation and authentication are integrated. Public data uses anonymous reads; admin database writes respect user RLS. Public reservations persist as pending requests, with a staff inbox, manual-source entry, controlled status changes, shared audit history and in-app notifications. Video settings are persisted through admin GET/PATCH and anonymous public reads, with tag invalidation after save.

Staff security and canonical email-directory behavior are documented in `docs/admin-staff.md`.

## Homepage video wiring — 1 November 2026

`20261101030000_home_video_config.sql` initializes the existing `home` singleton from the verified public clip only when no row exists. Existing configuration is preserved. The admin `/api/admin/video` GET/PATCH routes require active admin/editor access and use the authenticated user's client, so the common audit trigger records the actual actor. The server whitelists fields, derives the provider from a validated HTTPS source URL, validates VI/EN headings and visibility, and compares `expectedUpdatedAt` to reject stale writes with 409.

React Hook Form owns the editor and live preview; React Query loads/saves the configuration. The top-right Save control submits the whole form; there is no separate preview-update action. Supported sources are YouTube, Facebook, Vimeo and direct HTTPS MP4/WebM. Embedding/playback still depends on the source owner's visibility and embedding permissions. The page heading supplies the player title; no duplicate externally controlled video-title field is stored.

The homepage hydrates a shared public video query from anonymous, 60-second tagged reads. API responses contain only the public configuration, never staff fields. Hidden/missing configured records return null and do not resurrect a fallback video. Transport errors remain errors so the client can retry/retain prior data. A static verified default is used only without Supabase configuration. English uses `heading_en` when supplied, otherwise `heading_vi`. Saves immediately invalidate the `video-settings` tag and homepage path; open tabs recheck on focus or every minute.

Validation includes pure URL/input tests, rolled-back SQL checks for editor/ordinary permissions and audit attribution, live API save/reload/hide/stale-save/cache tests, and browser form/public rendering checks. Live test changes are restored through authenticated updates; audit history is retained.

## Two-file installation baseline — 2 November 2026

Active migrations now consist of app_baseline and app_initialization. Archived historical SQL is under supabase/history. The existing project migration history was reconciled without replaying schema creation or initialization; application row counts stayed unchanged. See supabase/README.md for fresh setup, one-time history transition and local verification.
