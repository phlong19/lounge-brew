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
