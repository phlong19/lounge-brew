# Supabase demo: event list and center video

29 October 2026. Revised plan, replacing the video-only/dashboard-editing pilot. No database changes or real booking submissions are enabled by this plan.

## Scope and access

An invited demo editor signs in at **`/admin`** and sees two tabs: **Events** and **Video**. The address stays out of public navigation/footer. Signed-out visitors go to `/admin/login` and return after sign-in. Include Sign out, field validation and truthful save feedback.

Use Supabase Auth with an invited email/password account; no public registration or credentials in source code. Verify the session and editor membership on server actions and enforce equivalent RLS. Authentication alone grants no editing rights. Add session refresh appropriate to this Next.js version, following [Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side/nextjs).

Save applies immediately after a successful write; a public reload demonstrates the result. Full CMS drafts/publishing are deferred. Keep other page sections on their existing sources.

## Events editor

List and edit artist/name, bilingual title/description, start/end, trusted poster URL, active state and homepage order. Provide Add, Edit and Deactivate; destructive deletion and image uploads are deferred.

Each event has two independent checkboxes:

- **Show on homepage** — `show_on_homepage`
- **Allow reservations** — `allow_reservations`

| Active, upcoming event | Homepage | Reservations | Result |
| --- | --- | --- | --- |
| Yes | Checked | Checked | Homepage card and reservation choice |
| Yes | Checked | Unchecked | Homepage card; no event-specific booking or picker option |
| Yes | Unchecked | Checked | Event list/detail and reservation choice, but no homepage card |
| Yes | Unchecked | Unchecked | Event list/detail only |

Inactive events are not public/reservable regardless of flags. Ended events are not upcoming/reservable; active past detail pages may remain available. Homepage visibility must not silently filter the general `/events` list. General table booking remains independently available.

Use shared eligibility rules for the homepage, detail CTA, reservation picker and preselection. Reject stale/disallowed selections instead of preserving an invalid programme. Real submissions remain out of scope; a later booking endpoint must recheck current permission on the server.

Extend existing `events` with non-null flags, order, and the missing `end_date`/`source_url` fields already used in the read model. Keep UUID keys internally and add a unique public/source-ID mapping so current numeric show URLs continue working. Do not query UUID columns using source IDs. Store timestamps as `timestamptz`, with venue-local input/display in `Asia/Ho_Chi_Minh`.

Seed the verified current inventory idempotently, explicitly setting flags to preserve current behavior. Validate dates/end-after-start and existing trusted poster sources. Do not invent shows, prices or availability. Replace the broad `events_authenticated_manage` policy with editor-only writes before exposing the editor.

## Center video editor

Fields: bilingual section heading, video title, **Video URL**, and **Show video section**. Detect the provider and show a preview before Save.

Initial supported adapters:

| Video URL | Player |
| --- | --- |
| YouTube watch/share/embed | Normalize ID and construct approved player URL |
| Facebook video | Supported video-only embed, with actual link/embedding permission verified in preview |
| Vimeo | Supported player URL, preserving necessary privacy parameters |
| Direct HTTPS MP4/WebM | Owned native video primitive with controls and contain sizing |

This accepts video links rather than a YouTube-only ID. It cannot guarantee playback of arbitrary sites, private videos or embedding-disabled content. Unsupported URLs must produce useful editor feedback; add other platforms through provider adapters rather than arbitrary iframe HTML. Check current provider documentation and real samples during implementation. Meta's documentation could not be fully retrieved in this planning pass. Vimeo has provider-specific [embed options](https://developer.vimeo.com/player/sdk/embed).

### Fixed display contract

- Keep the current centered desktop width and responsive mobile width.
- Every adapter uses the same **16:9 outer frame**, reserving its size before loading.
- Preserve complete video and controls. Portrait/square media may have neutral letterboxing; no stretching or cropping to fill.
- Use video-only provider players and supported sizing options. Never hide oversized Facebook player controls with overflow to force a fit—the earlier clipping problem must not recur.
- No autoplay by default. Keep accessible titles, keyboard controls and fullscreen where supported.
- Test each provider in admin preview. A later provider failure uses the same-sized fallback with one source link, avoiding extra duplicate links alongside a working player.

Use a singleton `demo_home_video` row: VI/EN headings, title, original URL, validated provider and normalized identity/options, enabled state, updated timestamp. Replace the earlier `youtube_id`-only proposal.

Validate URLs on save/read: approved HTTPS provider hosts or direct-file origins, no executable schemes, embedded credentials, arbitrary markup, scripts, styles or class strings. Metadata requests must use fixed provider endpoints with checked redirects, not arbitrary server fetches. Public read, editor-only mutation, and private editor membership are enforced through [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Implementation order

1. Inspect an isolated demo/development project's actual schema. Add forward migrations for editor membership, event fields/policies and source-ID mapping, plus video settings. Do not reset a project or blindly replay old migrations.
2. Seed current verified events/video. Add server-only `SUPABASE_CONTENT_DEMO_ENABLED`, default false, covering these two features only. Keep privileged credentials out of browser code and Git.
3. Implement `/admin/login`, session refresh, membership checks and the two-tab editor using owned primitives and Tailwind class maps.
4. Add typed, validated server adapters; wire homepage filtering, event list/detail and reservation eligibility through shared policies. Keep existing locale behavior and public URLs.
5. Add video adapters and the consistent frame; demonstrate preview → save → public reload.
6. Verify permissions, checkbox combinations, legacy URLs, stale selection, provider layouts and failure/empty behavior. Document account invitation, setup, seed and rollback.

Use fresh reads on public reload for the demo; defer Realtime and persistent caching. Booking stays UI and validation only. No submissions, notifications, payments, analytics or repository-wide CMS migration are included.

## Data behavior and rollback

- Flag off: current local behavior.
- Successful reads are authoritative: all homepage flags off means no homepage cards; all reservation flags off means no event choices. Empty data must not resurrect local events.
- Disabled or successfully missing video settings hide the section while the pilot is enabled.
- On read failures, preserve a deliberate last-known validated demo snapshot, including permission flags. Before any successful snapshot exists, use a safe empty event/reservation state rather than re-enabling potentially disabled events. Keep diagnostics internal.
- Invalid saves retain the last saved configuration. Turning the flag off is an explicit rollback to local behavior, separate from error handling.

## Acceptance

- [ ] Editor signs in/out through `/admin`; public navigation has no auth link. Anonymous and ordinary authenticated users cannot edit.
- [ ] Add/edit/deactivate a real event and test all four checkbox combinations in VI/EN, including detail buttons and reservation preselection.
- [ ] Stale/disallowed events cannot remain eligible; general booking works and remains UI-only.
- [ ] Existing numeric show URLs still work with database UUIDs.
- [ ] Preview/save playable YouTube, Facebook, Vimeo and direct-file examples. Compare identical frame bounds at 390/768/1440 px; inspect controls, letterboxing and fullscreen.
- [ ] Invalid, restricted, unsupported and unavailable videos have useful admin feedback and stable public layout.
- [ ] Empty, disabled and outage states do not silently restore event permissions.
- [ ] Lint, types, UI checks/build, policy tests and keyboard/touch browser checks pass; unrelated sections remain unchanged.

After this demo is accepted, expand using the comprehensive `2026-10-28-supabase-configurable-front-office.md` roadmap. The small pilot now proves authenticated editing and two public content types before wider adoption.
