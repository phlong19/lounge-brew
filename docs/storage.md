# Storage ownership and R2 connection

Decision recorded 9 November 2026.

| Media purpose | Intended primary storage |
| --- | --- |
| Staff avatars, logo/branding, seating plans, menu and other core site assets | Supabase Storage |
| Event posters/covers and article images; blog/journal covers and article images | Cloudflare R2 |
| Authentication, events/blog records and media metadata | Supabase database |

Keep direct public URLs in consuming records and article image sources. Media IDs remain useful for management; no asset join is required to display a cover.

## Current status

R2 integration now routes `event` (default) and `blog` upload purposes to R2 and `core` uploads to Supabase. Apply `20261109000000_r2_media.sql` before starting the updated app. Existing images are not migrated.

## Cloudflare setup

1. Create a Standard R2 bucket for public editorial images, for example `trixie-editorial`. Keep private material out of this bucket.
2. In R2 API tokens, create an Object Read & Write credential scoped to this bucket. Store the Access Key ID and Secret Access Key in `.env.local` and the deployment's secret environment settings. Do not commit them or send them through chat.
3. Copy the Account ID and bucket name. The S3 API endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`; SDK region is `auto`. For a jurisdiction-specific bucket, use its documented endpoint.
4. Configure a public delivery domain such as `media.example.com` in the bucket settings for production. A public `r2.dev` URL is for development and is rate-limited; it is not the S3 endpoint. Public access exposes objects in that bucket, so enable it only for intended public media.
5. Fill the R2 variables in `.env.local` from `.env.example`, and mirror them in the hosting environment. Restart the app after integration.

All access keys stay on the server. A public image hostname/URL is not a credential.

## Integration design

- Introduce a server-only storage adapter using the S3-compatible AWS SDK v3, with `region: "auto"` and the R2 endpoint above.
- Route authenticated uploads by an explicit validated purpose: editorial images to R2; core assets to Supabase. Enforce the existing active editor/admin checks, bounded uploads and image format/dimension validation before storage access.
- Extend `media_assets` to distinguish providers and retain bucket, object key and canonical public URL. Update policies/constraints, types, cover resolution, seating lookup and trusted rich-text image hosts together; the present implementation assumes Supabase `lounge-public`.
- Preserve direct event cover URLs and body URLs. Reuse hash-identical files within a provider/bucket. If a cover is still a pending local file, coordinate its upload with body insertion rather than uploading it to both providers.
- Keep legacy Supabase URLs readable; migrate existing editorial media separately with verified copies and explicit URL replacement. Do not delete old objects during initial connection.
- Start with server-proxied uploads through the existing endpoint; browser-to-R2 upload CORS is unnecessary for that flow. If presigned browser uploads are added later, configure narrow allowed origins/methods and verify the uploaded object before accepting it.
- Verify new event cover upload, identical body upload reuse, different body image, basic asset uploads, persistence/reload and public display before rollout. Never silently fall back to another provider when R2 is misconfigured.

## References

- https://developers.cloudflare.com/r2/api/tokens/
- https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
- https://developers.cloudflare.com/r2/buckets/public-buckets/

## Implemented connection

Server credentials are consumed only by `src/lib/server/r2.ts`. The AWS SDK signs uploads; credentials never enter the browser bundle. Only `R2_PUBLIC_BASE_URL` is exposed as `NEXT_PUBLIC_R2_MEDIA_URL` through Next configuration so the editor and public media components share the same trusted hostname/path. Restart/rebuild after changing that public origin.

The authenticated media API accepts multipart `purpose=event|blog|core`, defaults to event, and rejects unknown values. Editorial keys use `events/<sha256>.<ext> or blogs/<sha256>.<ext>` for per-purpose deduplication. Existing files are reused from metadata; simultaneous identical uploads use the same immutable byte content and unique metadata key. Core seating uploads explicitly pass `core`.

Apply the R2 migration using Supabase SQL Editor or the normal migration runner. It retains existing rows, adds a provider discriminator, and replaces the Supabase-only bucket relationship with provider-aware validation. It does not copy/delete files or change existing event content. This migration is independent of the pending event-description removal migration.

Verification still needed against your live services: authenticated upload, reuse of an identical cover in article content, event save/reload, public image load and seating upload. Automated checks do not establish that supplied credentials or bucket public access are correct.

## Live verification — 9 November 2026

Applied `20261109000000_r2_media` to the existing project before the missing-show import. Imported four shows (20875436, 71362849, 79213854, 65340728), preserving existing source IDs without updating their dates or content. Four distinct original images were uploaded to R2 and fetched back with matching SHA-256 hashes. Each event reuses its poster URL in its original article body. Stored article text was compared with the sanitized original, and anonymous event visibility was checked. The homepage displays the new events and their images.

The importer now uses the configured `SUPABASE_SECRET_KEY` rather than obtaining a legacy service-role key through the management API. Editorial import uploads require R2 and its provider-aware schema; they never silently fall back to Supabase. Use a dated `--manifest=upcoming-YYYY-MM-DD.json` to preserve previous import manifests. This import verification does not replace an authenticated admin upload/delete workflow check.

## Cached ticket palettes — 9 November 2026

Apply `20261109010000_ticket_palette.sql` after the R2 migration before deploying the updated media API. Event uploads analyse the validated bytes once, including an older deduplicated asset when it lacks the current extraction version. Media metadata stores palette key, analysis version and source SHA-256; event records carry a direct palette key for public rendering. No extra R2 requests or media lookup is needed per card view. The cover-sync trigger was verified inside a rolled-back transaction for replacement and unlinking.

`node scripts/backfill-ticket-palettes.mjs` previews current upcoming cover palettes and verifies authenticated R2 access against public delivery by checksum. Add `--apply` to save the palette metadata and event keys, with an optimistic cover URL check. It does not copy or delete images. The first run saved all 12 upcoming event palettes; existing article content, cover files and URLs remain unchanged. See `docs/ticket-colour-generation-plan.md` for extraction details and the proposed realistic ticket decoration work.

## Event deletion (9 November 2026)
Event Delete now permanently removes the record, with an optimistic version check and admin/editor permission checks. Events linked to reservations are blocked; hide them instead. The audit receipt retains only ID/title/date and actor, not another copy of the full article.

Only registered media belonging to the deleted cover/article are considered. Covers or body URLs still referenced by events, articles, seating or video configuration remain. Local bundled and external Trixie images are never deleted. Other previously abandoned uploads are not bulk-purged by this operation.

The transaction removes unused metadata and records private media_deletion_jobs; the server then removes the actual R2/Supabase objects. Claims prevent concurrent workers deleting the same job, and pending paths cannot be reused. Failures retain durable jobs and are retried during subsequent authenticated uploads/deletions; this is not a scheduled background worker. Service credentials and the queue are never exposed to staff clients. Run scripts/verify-event-deletion.mjs for rollback-only live DB contract checks.

## Transactional media lifecycle and private drafts — 10 November 2026
New event/article forms have an editing-session UUID. Every immediate upload (including a reused file) gets a user-scoped claim. Incomplete drafts live in private content_drafts; only active editors/admins can read them. They never enter public event/article queries. Save Draft persists the draft and releases the session claims in the same DB transaction; used files remain protected by draft references. Publishing atomically writes the validated canonical record, removes its private draft, and releases upload claims.

Replacement/removal triggers for events, articles and seating settings inspect old image references, preserve images used by any live record, private draft or editing session, and enqueue unused media before removing their metadata. Explicit creation discard releases only that staff member's session claims and queues unused uploads transactionally. The storage outbox then removes files from R2/Supabase; it retries on subsequent authenticated operations. External Trixie URLs and bundled local files are not storage-owned objects and are never deleted.

Form Cancel, Close, Escape, backdrop dismissal and ordinary in-app navigation during creation show a Save Draft / Discard / Keep Editing dialog. Browser tab close uses the native unsaved-work warning. A crash cannot complete a network transaction: claims abandoned for seven days become eligible for cleanup during a later admin operation. Persisted draft/live references always protect their files. There is no periodic scheduler yet. Previously untracked uploads are not bulk-purged.

Run node scripts/verify-content-drafts.mjs for rollback-only database contract checks. It covers partial drafts, failed promotion rollback, shared draft/record images, session isolation, article replacement/deletion, and seating-map removal.

Deleting an event from an open editor also releases that editor session in the same transaction, covering replacement/body uploads that had not been saved yet. Admin list summary views exclude article bodies; details are loaded for one item only.
