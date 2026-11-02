# Pre-merge security and query review — 2 November 2026

Reviewed branch: feat/reservation-foundation, starting at da70dcf. Review fixes remain uncommitted. No merge or deployment performed.

## Findings addressed

- **High/critical dependency advisories:** updated Next.js 16.2.4 → 16.4.3, sharp 0.34.5 → 0.35.5 and next-intl 4.3.6 → 4.14.9; refreshed compatible transitive packages. Original audit reported 6 critical, 38 high, 26 moderate and 3 low advisories; these counts are dependency advisories, not demonstrated exploits in this application. Final production dependency audit reports zero. One moderate minimatch advisory remains in development-only ESLint tooling (GHSA-g3hv-75wg-m249); avoid processing untrusted project/glob input in that tooling. The affected v10 dependency is now overridden to patched 11.0.1; lint/type checks pass. Legacy v3 callable-API consumers remain unchanged. The remaining advisory covers minimatch 3.1.5 via a broad affected-version range; v3 has no optimizationLevel preprocessing path described by the advisory. No audit suppression is configured.
- **Reproducibility:** pnpm-lock.yaml is no longer ignored. Include it in the review commit; frozen installation passed. Newly introduced optional native build scripts remain explicitly disabled; application build succeeds.
- **Admin table payload:** event lists now omit full article/description fields. The editor loads a full event only when opened, with loading/error/retry UI; forms cannot submit unloaded content. Browser verification used summary-only lists and verified article content survived a save. Lists still use client-side filtering/pagination and fetch summaries in bounded batches; server-side filtering is a future scaling step for large archives.
- **Repeated event reads:** request-scoped React cache now shares the event record between metadata and event-page rendering.
- **Repeated staff checks:** admin layout and page share request-scoped verified staff lookup. Route-handler checks still execute per request, and authorization is never cached between requests/users. Proxy refresh remains separate; bypassing the proxy does not grant access because route checks and RLS are independent.
- **Origin defense:** reject Sec-Fetch-Site: cross-site even when Origin is absent. Non-browser requests still require authentication for private APIs and public bookings still use atomic quotas. Origin checks are not a bot defense.

## Checks completed

- Lint, TypeScript, UI source rules, all 26 test suites and production build passed after changes.
- Production browser checks at 390/768/1440 and both public locales: no public-summary hydration refetch, no redundant fresh navigation refetch, one background refresh shared by observers, cached content retained after simulated failure, no page errors.
- All five admin routes retain sidebar identity. Mocked mutations verified save/error feedback and modal interactions; test data was not persisted.
- Direct production HTTP probes: anonymous admin reads denied; foreign-origin writes denied; cross-site metadata without Origin denied; anonymous reservations/staff/audit reads denied by database privileges/RLS; admin reads succeed with private/no-store responses; non-admin staff directory reads and creation denied. No staff or booking data changed by these probes.
- No current privileged environment values in tracked/versionable files, client static build or all-branch Git patch history. High-confidence secret/PAT/private-key patterns absent from Git history. This does not prove absence of every unknown or previously rotated secret.
- Server secret client is server-only, accepts sb_secret_ keys and has no legacy fallback. Public fetches use the publishable key; private booking/customer data is not hydrated into public summaries.
- Existing tests cover HTML/link/media sanitization, database input validation, booking phone normalization/idempotency and privileged SDK key usage. Code review covered staff API roles, revoked-token checks, reservation quotas/lifecycle triggers, public cache allowlists and upload byte/pixel/MIME limits.

## Remaining verification and operational limits

- All five live transactional database contract suites passed via a direct verified-TLS connection using the official Supabase CA. Test fixtures were rolled back. The replacement Management API token was verified successfully against the intended healthy project on 2 November 2026. Live schema inspection revealed an existing admin/editor-only role constraint; application checks, the schema contract and a forward migration now match that current two-role model. Existing accounts were not reassigned.
- This is a bounded application review, not an independent penetration test or a guarantee of zero vulnerabilities.
- Dashboard notifications require an open dashboard. Public summaries refresh on a one-minute interval by design. Realtime invalidation plus polling is intentional fallback; concurrent events/mutations can cause an additional freshness fetch.
- Before public deployment, verify production Auth rate limits/CAPTCHA policy and trusted proxy headers; local API tests do not certify Vercel edge configuration or resistance to distributed booking/login abuse.
- Recommend merging into dev for staging after committing these review fixes. Main/public deployment should follow staging checks and the completed live DB contracts.
