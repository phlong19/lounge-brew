# Events pilot: live Supabase workflow

Implemented 30 October 2026. `/admin` now signs in and loads events from Supabase; `/admin-preview` has been removed. There is no browser-only event save or snapshot fallback in the admin. Video settings remain the existing local preview and are outside this phase.

## Access and migration

- Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the legacy anon-key name also works).
- An Auth account must have an active `staff_members` row with role `editor` or `admin`. Both roles can read, create, update and soft-delete events. Managing staff membership remains admin-only under the existing policies.
- `20261030010000_event_crud.sql` is the forward migration after the initial schema and admin-persistence migration. It has been applied to the connected demo project. It adds `is_deleted`, restricts staff to the two roles, filters deleted events from anonymous reads, and revokes physical event deletion from authenticated users.
- Admin requests use verified user sessions and row-level security, without a service-role key. The Next proxy refreshes admin session cookies. Mutations reject mismatched browser origins.

## HTTP interface

| Endpoint | Behavior |
| --- | --- |
| `POST /api/admin/session` | Email/password sign-in; checks active staff membership and sets session cookies. |
| `DELETE /api/admin/session` | Sign out. |
| `GET /api/admin/events?page=1&limit=100` | Non-deleted records, including hidden and past events; `{items,total,page,limit}`. Maximum page size 100. |
| `POST /api/admin/events` | Create; returns `{item}` with status 201. |
| `GET /api/admin/events/:id` | One non-deleted event, using its database UUID. |
| `PATCH /api/admin/events/:id` | Partial update. Optional `expectedUpdatedAt` detects stale edits and returns 409. |
| `DELETE /api/admin/events/:id` | Update `is_deleted=true` and `is_active=false`; retain the row, audit history and images. |
| `POST /api/admin/media` | Multipart image upload, returning `{asset,url}`. |

Event writes accept title, artist, dates, short descriptions, rich content, cover references, visibility and fee fields. `additionalFee` maps to integer `additional_fee`; `isDeleted` maps to `is_deleted`. Restoring uses `PATCH {"isDeleted":false}` and does not automatically re-enable visibility. Source IDs cannot change after creation; imported public URLs continue using their original source ID. Actor IDs and generated IDs cannot be supplied by clients.

Errors use `{error}` with 400 validation, 401 sign-in, 403 permission/origin, 404 missing/deleted record, 409 duplicate/stale edit, 413 request size, or 503 connection/schema failures. The public site explicitly excludes deleted events; when a database is configured, event-query failures do not resurrect old snapshot shows.

## Images and rich content

- Poster replacement uses the existing dropzone. The content toolbar supports upload, paste/drop of image files, and the existing trusted-image link option. Save is disabled while content images upload; save failures retain the open editor.
- Actual image format, dimensions and file size are checked server-side: JPEG/PNG/WebP, 10 MB, up to 40 megapixels. Uploads use hash-based paths in `lounge-public` and record metadata in `media_assets`. Identical files reuse existing assets.
- All images in this pilot are public website media. `lounge-drafts` is reserved for a later private-draft workflow. Cancelled edits may leave uploaded assets; this phase does not automatically delete images.
- Stored HTML is constrained to supported editorial elements, safe links/images and validated text colours. The public event page renders full content through the owned rich-text renderer.

## First import

Run from the repo: `node scripts/import-trixie-event.mjs` while the local server runs. `ADMIN_API_URL` defaults to `http://localhost:3001`. The script uses the existing local `ACCOUNT_EMAIL` / `ACCOUNT_PASSWORD` credentials; these are server-side development settings, never public client variables or committed values.

The fixture `supabase/imports/phuong-linh-47320159.json` identifies the original show and its actual image URLs. It imports **Phương Linh, 30/10/2026, 20:15–22:00** with the original poster and both seating-plan images. The body is a concise factual Vietnamese summary with the original images; English text and an unspecified fee remain empty rather than invented. The event is initially hidden for review. No other shows are imported in this phase.

Import checks the unique source ID before uploading, skips existing records without overwriting edits or restoring deleted data, and deduplicates images. Successful reruns have been verified. Use the admin visibility checkbox and Save when the imported event is ready to appear publicly.

## Verification

- Automated validation, sanitization, two-role access and soft-delete policy tests, plus the existing suites.
- Live editor account: sign-in/out; anonymous rejection; origin rejection; invalid-image rejection; poster/body uploads; create/update/read after reload; stale edit conflict; soft-delete keeps the physical row; removed preview route returns 404.
- Public rich-text article renders the actual stored poster and seating images. A separate ended test record was temporarily restored for this check and soft-deleted afterward; the imported event remains hidden.
- Admin list and editor checked at 390/768/1440px, including body image loading and no page overflow. Green/orange badges distinguish upcoming/past shows. Preview header controls are removed.

## Shared seating and revised event details — 30 October 2026

Event headers use programme titles and Hanoi calendar dates. Article width is capped at 46rem. Posters remain in editorial content instead of the header.

The sidebar uses a vertical Embla carousel of other visible, strictly future shows, nearest first, excluding the current event. It hides when empty and stacks after the article on narrow screens. Summary-only anonymous queries use a 60-second Next cache shared between detail URLs; event mutations expire the cache tag.

Admin → Sơ đồ chỗ ngồi manages two public-bucket image references and shared visibility. GET/PATCH /api/admin/seating require active staff. Saves use timestamp conflict detection, public-image validation and database audits. The reusable SeatingPlan offers enlarged-image dialogs.

Migration 20261030020000_seating_settings.sql is deployed and live types regenerated. The official images already existed in lounge-public; hosted copies were compared byte-for-byte with fresh official downloads before configuration. Duplicate map images and the exact seating heading were removed from the current event body, preserving the rest of the article and its edited date. Future event imports no longer embed maps.

## Full upcoming-event import — 30 October 2026

The live original listing had ten missing future shows across pages one and two, including Văn Mai Hương on 18 December and Nguyễn Kiều Oanh on 19 December. All ten were imported publicly with original Vietnamese article text, supported editorial structure, verified source start/end times, original posters and body images. Existing records were skipped, including the edited Phương Linh date and content.

The importer checks normalized article text before and after persistence, uploads every available image to lounge-public using hash-based paths, and verifies hosted bytes against originals. Thirteen unique image assets were verified. Shared seating content is trimmed recursively at its original heading, including nested source containers. A broken blob image in Nguyên Hà's source was omitted with the user's acknowledgement; it can be added later through the editor. No English article or unverified price was invented.

Run node scripts/import-trixie-upcoming.mjs for a dry run, or add --apply to insert missing records. The command scans live listing pages until no upcoming cards remain, filters started shows by verified schedules and never overwrites existing source IDs. It uses the existing project management token only server-side; the import key remains in memory. Reviewable source manifests are in supabase/imports/upcoming-2026-10-30.json.

The public page now uses a read-only six-week month calendar with the event date highlighted, a 1440px container, original readable-width article text and a one-floor-at-a-time seating carousel. Seating autoplay respects hover, focus, visibility, reduced motion and enlarged-map modal pause. The public source link and synthetic pilot article heading are hidden; the stored pilot article stays unchanged.

## Verified past-event import — 31 October 2026

Archive mode scans original listing cards across pagination, including ended shows. Existing source IDs, including hidden or soft-deleted records, are preserved. Candidates are checked from newer title dates first. Original article dates must agree with titles; a start time must be explicitly present in the source. Unspecified end times stay null.

The complete archive scan found nine fully verifiable missing past shows. Other entries were excluded because the original URLs were unavailable/redirecting, had conflicting dates, or lacked a verifiable date/start time. The review manifest records imported candidates and skipped-source reasons in supabase/imports/past-2026-10-31.json.

Use node scripts/import-trixie-upcoming.mjs --past --limit=20 for a dry run. To apply the reviewed manifest without recrawling unavailable pages, use --past --from-manifest --apply. Actual saved rows preserve original article text and supported structure, upload original images to the public bucket, and verify hosted bytes. Ended shows remain publicly readable at their detail URLs and manageable in admin, but are excluded from booking choices and upcoming-event sections.
