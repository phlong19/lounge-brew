# Trixie redesign: implementation report

26 October 2026. The agreed public redesign is implemented locally. The UI UX Pro Max and Taste frontend skills were installed and applied alongside the repository rules.

## Delivered

The new direction uses emerald, warm paper, Be Vietnam Pro, authentic Trixie photography, and the original gold logo. Home, menu, events, durable show details, journal/articles, gallery, contact, and private-event sections now share one bilingual component system.

[AGENTS.md](../../AGENTS.md) enforces Tailwind-class styling and feature composition through reusable primitives. The repository owns Typography, semantic layout/link/media/form primitives, and adapted shadcn/Radix controls. The only stylesheet content is the Tailwind import. Source checks cover intrinsic-tag boundaries, injected markup, and authored styles.

The flipbook preserves all 18 latest original artwork pages. It supports desktop spreads, mobile single pages, category and thumbnail jumps, shared page URLs/history, keyboard controls, zoom/panning, expand dialogs, focus restoration, reduced motion, failed-image retry, and original-image links without JavaScript. Navigation and zoom controls sit above the artwork on mobile. The older 16-page set and unused mock dataset were removed.

Show listings use fixed verified dates, venue-local times, and authentic posters. Ended shows retain their detail URLs and show their past status without a show-reservation button. Database failures fall back per dataset; successful empty results stay empty. Stored articles render through safe primitives, including trusted images. External image sources use an exact allowlist following [Next.js image configuration guidance](https://nextjs.org/docs/messages/next-image-unconfigured-host).

## Verification

| Check | Result |
| --- | --- |
| `npm run verify` | Passed: ESLint, TypeScript, source rules, tests, production build. |
| Regression tests | 49 passed across 9 suites; 0 failures. |
| UI rules / diff whitespace | 0 violations / clean. |
| Production-browser route captures | 19 route/locale/viewport cases; no runtime errors, broken loaded images, or horizontal document overflow. |
| Interaction checks | 18 passed: category jumps, spread navigation, keyboard/history, zoom/pan, focus restoration, mobile navigation, language switch, reduced motion. |
| Boundary/fallback checks | 13 passed: 360/375/390/768/1440px menu sizing, covers, invalid page values, ended/missing shows, gallery focus, image failure/retry, all 18 no-JavaScript links. |

Verified against the actual production build in Chromium. Independent code review found remote-image configuration, expiring show links, and dropped article images; all three were corrected and checked. Node suites exercise empty/error data responses; a live Supabase publishing workflow was outside this redesign.

Screenshots were inspected for hierarchy, Vietnamese wrapping, image proportions, contrast, mobile controls, and consistency. The critique led to a shorter two-line hero headline, controls above the menu artwork, and measured phone sizing. Original menu pages remain uncropped; zoom provides reading access to their printed text.

Preview images: [desktop home](screenshots/2026-10-26/home-desktop.jpg), [mobile home](screenshots/2026-10-26/home-mobile.jpg), [desktop menu](screenshots/2026-10-26/menu-desktop.jpg), [mobile menu](screenshots/2026-10-26/menu-mobile.jpg).

Detailed local evidence: `/tmp/trixie-final-verification.log`, `/tmp/trixie-production-check/audit.json`, `/tmp/trixie-interactions/report.json`, and `/tmp/trixie-edge-check/report.json`.

## Operational boundaries

Reservations call the verified Trixie hotline. The admin area remains a clearly labelled read-only scaffold; staff authorization, editing/publishing, and booking ingestion need separate backend work. The preserved menu is image artwork, with category labels and accessible controls; full screen-reader transcription of its printed contents is not included. The local show snapshot is dated 26 October and needs ongoing content updates.

The existing `.env.example` user edit was preserved. Changes are uncommitted and unpublished. Start locally with `pnpm dev` (or `npm run dev`). The inspected production preview runs on `http://127.0.0.1:3010` while its server remains active.
