# Configurable Trixie front office and Supabase rollout

Date: 28 October 2026. Status: implementation plan; no database migration, live booking submission, or external notification is enabled by this document.

## Outcome

Let venue staff maintain the complete public website, publish changes safely in Vietnamese and English, and turn show/menu interest into qualified booking requests. Preserve the current Trixie identity, default section order, complete menu artwork, and authentic content. “Configurable” means editable content and approved presentation options through the existing components, with validation and preview.

The public booking form remains UI and validation only until the booking integration phase is explicitly implemented. Staff must be able to distinguish a request from an accepted reservation.

## What exists in the repository

- Next.js, next-intl, Supabase server/browser clients, and a read service for categories, menu items, shows, and articles.
- Per-dataset fallback to verified local content when a read fails. A successful empty database response is already authoritative; retain that distinction.
- Read-only admin fields with disabled save/publish buttons. The admin layout checks authentication, but has no explicit staff-role check.
- One initial migration defining four content tables. Its authenticated management policies grant writes to any authenticated user. Replace these before enabling a writable admin interface.
- Most homepage content is still local: hero, day chapters, food groups, archive, menu artwork metadata, video, navigation, and venue/footer settings.
- Schema differences to resolve: source show IDs are numeric strings while database IDs are UUIDs; the read model also supports `end_date` and `source_url`, which the initial migration does not define.
- This review inspects repository code; it does not verify the state of a hosted Supabase project.

## Configuration coverage

| Public area | Editable content and behavior |
| --- | --- |
| Venue and announcement | Name, logo, address, phones, hours, map place/link, short notice, notice visibility, default language |
| Header | Bilingual navigation labels, order, destinations, approved child links, booking button label |
| Hero | Real images, alt text, bilingual copy, slide order, CTA type and destination, approved timing |
| A day at Trixie | Chapter labels, titles, full bilingual rich text, approved emphasis colors, images, actions |
| Shows | Artist, titles, venue-local start/end, real poster, source reference, publication state, featured order, verified booking terms |
| Menu | Versioned menu editions, all original page images, dimensions, category/page labels and order; current 18-page edition retained |
| Food gallery | All dishes, bilingual names/descriptions, real images, group assignments/order, detail links; prices only when supplied and verified |
| Video | Validated YouTube video ID, bilingual heading, publication/visibility, source attribution |
| Archive | Albums/photos, titles, real dates where known, alt text, order, publication and media-availability states |
| Footer | Contacts, map configuration, Facebook page URLs, Instagram/YouTube/Pinterest links and order, footer navigation |
| Booking | Approved required/optional fields, event choice rules, venue hours, group limits only if real, contact consent copy, actual workflow mode |
| Search and sharing | Localized page titles/descriptions, social image, canonical URL, verified venue/event structured data |

Global settings and section content are bilingual. VI remains the default; English can fall back to VI as today. Preview should flag missing translations for editors. Publish cannot silently invent a translation, image, price, seat count, or event time.

Editors use bounded choices for section visibility/order, contrast-safe themes, crops, and carousel timing. The current order is the initial published configuration. Arbitrary CSS, Tailwind class strings, scripts, iframe HTML, and executable rich text are never accepted as configuration. Embed settings store validated provider IDs/URLs and approved options.

## Content and data model

Use migrations and generated database types, extending existing tables rather than introducing a second unrelated CMS.

| Model | Purpose |
| --- | --- |
| `staff_members` | Auth user membership and scoped capabilities: manage staff, edit, publish, handle bookings |
| `site_settings` + revisions | Venue, navigation, languages, social destinations, approved embed settings, SEO defaults |
| `page_revisions`, `page_sections` | Draft/published configuration with approved block types, stable section IDs, order, visibility, and validated bilingual payloads |
| `media_assets` | Storage path, dimensions, alt text, source/rights reference, publication state; no expiring URL persisted |
| Existing `events` | Add end time, source reference, public slug/source ID, draft/published state and booking metadata |
| `menu_editions`, `menu_pages` | Complete page artwork and metadata; one active published edition switched as a unit |
| `food_groups`, `food_items` | Replace the local product/group inventory without discarding any item |
| `albums`, `album_photos` | Archive metadata and available/unavailable photos; keep existing source IDs |
| `reservations`, `reservation_activity` | Private request data, operational status changes, assignment, timestamps and audit trail |
| `content_audit_log` | Editor, action, revision and timestamp for publishing/rollback |
| Conversion events or analytics adapter | Minimal non-PII funnel events, linked by request/session IDs where appropriate |

Keep UUID primary keys internally. Add unique stable public slugs and source IDs; preserve existing numeric show URLs through explicit lookup/redirect mapping. Add `end_date` and `source_url` before relying on them. Store timestamps as `timestamptz` and display/validate them in `Asia/Ho_Chi_Minh`.

Prefer relational models for events, menu pages, dishes, photos, and reservations. A versioned, runtime-validated JSON payload is appropriate for bounded page sections; it is not a substitute for foreign keys or booking integrity.

## Security and publishing foundation

1. Create staff membership managed only by authorized administrators. Authentication alone must not grant edit/publish or booking-data access. Remove the broad authenticated write policies in a forward migration. Verify unauthenticated, ordinary authenticated, editor, publisher, and booking-staff access independently. [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).
2. Verify sessions on the server for admin actions and implement the SSR session-refresh flow appropriate to this Next.js project. Fail closed for unauthorized writes; keep the existing no-credentials admin preview read-only. [Supabase SSR client guidance](https://supabase.com/docs/guides/auth/server-side/nextjs).
3. Give public readers only published, visible content. Drafts, staff membership, audit records, and reservation contacts are private. RLS and grants enforce this in addition to route guards.
4. Keep draft uploads private. Use short-lived preview URLs; validate type, size, dimensions and supported formats. Publish verified assets to a versioned public media location before switching the published database revision. Preserve old assets for rollback; clean orphan uploads later. Staff-only Storage policies are required. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
5. Treat publication as one database transaction that switches a complete validated revision. Use optimistic concurrency to prevent one editor overwriting another. Invalidate affected public caches after publication and rollback. A storage upload is not itself an atomic database publish.
6. Service credentials stay server-only. Public configuration cannot reveal secrets, private routing destinations or reservation contact details. Restrict links, rich-text colors, media origins, and embed providers with existing safe rendering boundaries.

## Release sequence

### Release 1 — secure, fully editable website

- [ ] Audit hosted schema/auth/configuration against the repo; back up existing content and test migrations in staging.
- [ ] Add staff authorization/RLS, schema corrections, stable public-ID mapping, private draft/public published media policies.
- [ ] Import current assets and all content idempotently: 3 hero slides, 3 full day chapters, 21 dishes, 26 archive records, the complete 18-page menu, existing shows/articles, video, navigation and footer settings.
- [ ] Build editors for settings, bilingual copy, menus, shows, dishes, archive and video; include asset selection, meaningful validation and unsaved-change handling.
- [ ] Add draft preview, publish, revision history and rollback. Preview uses the same public components and responsive layouts.
- [ ] Replace local feature imports through typed server content adapters. Reuse `getLoungeData`/content-policy behavior; keep a deliberate last-known published fallback and log failures internally.
- [ ] Add media/YouTube reference checks that alert staff about unavailable content. Avoid extra technical failure explanations on the public page.

Acceptance: an authorized editor can change every area listed above without a code edit. A publisher can preview/publish/rollback it. Unpublished changes never reach public readers. All source content and original URLs are preserved; successful empty datasets do not resurrect hidden items.

### Release 2 — turn interest into real booking requests

- [ ] Add a server booking route using the same domain validation as the dialog, with server-side venue-time checks, event/date checks and idempotency.
- [ ] Persist only validated fields. Protect the route against spam/duplicates and cross-origin abuse; keep private reservation tables inaccessible to anonymous clients. Never expose a general-purpose privileged write endpoint.
- [ ] Extend the existing review step to submit only after the real endpoint is enabled. On a confirmed database write, show a request reference and the accurate pending state. An insert does not promise a table or seat.
- [ ] Add a staff inbox with assignment and explicit statuses: new → contacted → confirmed / declined / cancelled. Retain an activity log and distinguish staff acceptance from automated receipt.
- [ ] Add configurable event-specific booking terms only when supplied. Preserve show preselection and allow general visits.
- [ ] Add an explicit group/private-event inquiry path with appropriate fields and a clear CTA.
- [ ] Connect approved notification destinations after the venue supplies them. Delivery failures must not lose the saved request; staff can see retry state. Sending notifications is not part of this UI task.
- [ ] Set retention, access and deletion rules for contact data. Do not log phone, email, notes or names in analytics.

Acceptance: a valid request creates one private record and reference, retries do not duplicate it, invalid/ended/cancelled shows are rejected appropriately, and unauthorized users cannot read or modify contacts. Staff can confirm the request and track follow-up.

### Release 3 — improve the booking funnel with evidence

Prioritize useful selling information over additional moving sections:

- **Show intent:** booking buttons on show pages preselect that show. Display verified date/time and any approved price/terms near the action. Keep genuine sold-out/cancelled states in sync if inventory exists.
- **Menu intent:** retain the full menu experience, with real dish highlights and a relevant reservation action. Do not invent prices or availability to fill a card.
- **Private events:** provide a focused inquiry route for group size/date/type, supported by actual venue imagery and verified service details.
- **Lower friction:** keep the dialog short, support autofill, preserve information on recoverable errors and provide useful validation at the field. Avoid repeated contact prompts and competing buttons in the same place.
- **Follow-up:** a staff-owned queue and measurable response time help convert requests into confirmed visits. Publish a response promise only if the venue approves and can meet it.
- **Acquisition:** use accurate localized metadata, event share cards and verified structured data. Track approved campaign parameters without adding personal information to URLs.

Measure: relevant section/show visit → booking open → valid review → saved request → staff contact → confirmed booking. Primary outcome: confirmed bookings per qualified visit; also monitor request completion, validation failures, mobile abandonment, and time to first staff response. Opening a dialog is not a sale.

Collect a baseline, ship one meaningful change at a time, and compare comparable periods/event traffic. Define targets from actual data. Add experiments only when there is enough traffic to interpret them; never use fake reviews, countdowns, seat counts or scarcity.

## Technical boundaries and verification

- Keep Next.js/React/next-intl/Supabase and the owned UI primitives. Tailwind class maps remain the source of styling; CMS configuration selects approved variants rather than injecting styles.
- Keep the existing flipbook and Embla adapters. Preserve accessible controls, reduced-motion behavior and keyboard/touch operation.
- Test database grants/RLS with each role, draft isolation, asset access, atomic publication/conflicts/rollback, legacy URLs, and authoritative empty responses.
- Test booking validation, rate limits, retries/idempotency, private-data access and notification failure paths separately.
- Run repo lint, TypeScript, UI boundary checks, tests/build, and browser checks in VI/EN at 390/768/1440 px. Cover dialog focus, form errors, original artwork proportions, mobile performance, and failure states.
- Roll out staging first. Use a server-controlled content/booking feature flag and a rollback path. Do not auto-apply production migrations or enable submissions merely because the editor UI is ready.

## Inputs needed when the backend rollout starts

The Supabase project/environment and migration access; initial staff accounts/roles; ownership and allowed use of media; real booking acceptance rules; notification destinations; retention policy; verified prices/packages or inventory, if offered; and the approved analytics choice. These do not block the current UI changes or this plan.
