# Trixie: skill installation, repo audit, and redesign brief

Date: 26 October 2026, Asia/Saigon. This records the initial installation/audit/brief phase. The user subsequently authorized implementation; see [the completed redesign report](2026-10-26-trixie-implementation.md).

Follow-up: the user confirmed that Trixie's logo/identity and the existing menu artwork should be preserved, with the flipbook as the primary menu experience. This overrides the initial text-menu-first recommendation below. See [the updated redesign proposal](../superpowers/specs/2026-10-26-trixie-redesign-design.md). A subsequent browser review successfully captured the original home/menu pages at 1440px and 390px using runtime libraries extracted under `/tmp`; the original browser limitation has been resolved for this review.

## 1. Skills installed and exercised

| Skill | Installed location | Source |
| --- | --- | --- |
| UI UX Pro Max | `/home/longph/.codex/skills/ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max) |
| Taste Skill, `design-taste-frontend` | `/home/longph/.codex/skills/design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill), linked from [tasteskill.dev](https://www.tasteskill.dev/) |

Installed from the upstream `main` branches using the Codex skill installer. Both `SKILL.md` files were read in this session. UI UX Pro Max's Python search and Taste Skill's Node lint/direction scripts ran successfully. The skills are installed globally for this user and will be discoverable on the next turn; their files were loaded manually for this audit.

Use UI UX Pro Max for usability, accessibility, and Next.js guidance; use Taste Skill for composition, imagery, copy, and critique. Treat generated suggestions as candidates requiring product judgment. The broad design-system search and its narrower retry returned generic software-oriented styling, so neither palette/layout was adopted. A separate `nextjs` search returned relevant font-loading guidance.

## 2. Repo audit

The existing Next.js 16 / React 19 / Tailwind 4 / next-intl / Supabase foundation is reusable. The problems are content credibility, guest journeys, repeated decoration, and unfinished functionality.

| Priority | Finding and evidence | Recommended action |
| --- | --- | --- |
| P0 | `src/app/layout.tsx:9`: `DM_Sans` requests an unsupported `vietnamese` subset. Both TypeScript and the network-enabled production build fail here. | Select a font with verified Vietnamese support; keep font loading in the root layout. |
| P1 | `src/app/page.tsx:15`: homepage events bypass the data service, use stock imagery, contain English descriptions in the Vietnamese experience, and calculate invented future dates from `Date.now()`. | Use one verified, localized event source on home and `/events`; never advertise generated dates as real bookings. |
| P1 | `src/lib/server/lounge-data.ts:50`: any one query error silently replaces all content with mocks. The fallback includes April 2026 events (`src/data/mock-data.ts:753`) without the live query's upcoming-date filter. | Separate preview data from production content; filter dates consistently, report errors, and show an honest empty state. |
| P1 | `src/app/page.tsx:61`: primary action only scrolls to events. Event articles have no reservation links; phone/address are plain text. | Add a clear `Đặt bàn` action, event-specific reservation context, `tel:` links, and directions. |
| P1 | `messages/vi.json:3`, `messages/en.json:3`, `src/app/layout.tsx:20`, and homepage footer still identify the venue as Lounge Brew. | Establish Trixie branding, metadata, and guest-facing copy consistently. |
| P1 | `src/app/menu/page.tsx:14` and `src/components/lounge/flipbook-menu.tsx:64`: menu is image-only with generic image descriptions; it has no category jumps, zoom controls, or page `h1`. | Keep the flipbook primary, preserve the artwork, and improve category/page navigation, readable zoom, keyboard access, and mobile controls. The user confirmed using the latest 18 pages from the original site to replace the older 16-page set. |
| P1 | `src/app/admin/page.tsx:20`: save/publish buttons have no handlers; draggable items do not persist order. `src/app/admin/layout.tsx:19` checks login but not a staff role. The supplied SQL policies grant all authenticated users write access (`supabase/migrations/0001_initial_schema.sql:101`). | Treat admin as a scaffold. Implement staff authorization and persistence before offering operational controls. These are source findings, not a claim about the deployed database. |
| P2 | `src/app/globals.css:43`, `src/app/page.tsx:94`, `src/components/lounge/event-polaroids.tsx:51`: layered gradients, a decorative background grid, large rounded glass panels, shadows, and tilted cards recur across unrelated sections. | Establish flat surface/type/spacing tokens and let real venue and performer imagery carry the visual identity. |
| P2 | `src/components/layout/site-header.tsx:24`: wrapping desktop navigation includes admin, lacks a semantic `nav` and active-link `aria-current`, and has no dedicated mobile navigation. | Simplify guest navigation and design a usable mobile version. |
| P2 | `src/app/admin/page.tsx:63`: several inputs remove outlines without a replacement. Event animation and flipbook motion have no explicit reduced-motion handling. `src/lib/utils.ts:23` formats event times without a venue time zone. | Add visible focus, reduced-motion behavior, and `Asia/Ho_Chi_Minh` date formatting. |
| P2 | `src/app/journal/[slug]/page.tsx:62`: article HTML is inserted directly without sanitization visible in this repo. | Define trusted authoring and HTML sanitization before enabling editorial publishing. |

The live [Trixie homepage](https://trixie.com.vn/) provides the venue's address, hotlines, café/food offering, reservation entry point, and dated minishow listings. For example, it lists Phương Linh on 30 October and Myra Trần on 31 October 2026. These are reference content, not an availability guarantee. The site's parsed text also exposes a sample HTML caption. Live-site findings here are based on fetched content, not a completed visual browser review.

## 3. Redesign brief

**Goal:** help a guest choose a show, understand the venue, and reserve a table. Vietnamese first, with a complete English experience.

**Recommended direction: Trixie's living show programme.** On this page, the dated minishow posters for 165 Thái Hà become a browsable programme linking each performance to a reservation action. Preserve the relationship between the daytime café and evening music venue.

Taste Skill dealt three approaches: `page-is-the-object`, `colour-chapters`, and `contact-sheet`. The programme approach uses `page-is-the-object` because the venue already has menus and dated show material. Its exploratory sheet has seed `1939192393`, with no redraws, saved at `/tmp/trixie-taste-direction/direction.json`. The full sheet is not an approved implementation: its folder hero, founder letter, stock night imagery, and Switzer typography need content/asset-fit review before use. No founder quotation or venue imagery should be invented to satisfy a blueprint.

| Approach | Benefit | Trade-off |
| --- | --- | --- |
| Show programme — recommended | Gives dates, performers, and booking a distinctive shared structure. | Requires verified show posters and consistent event data. |
| Day/night colour chapters | Expresses the café-to-lounge transition clearly. | Long full-screen sections can slow access to booking. |
| Photo contact sheet | Makes a genuine venue/performance archive prominent. | Requires substantially more owned imagery; weaker as the main reservation journey. |

Proposed page argument, in order:

1. **This is Trixie, café and live music at 165 Thái Hà.** A short title, real venue or performer image, next verified performance/date, and visible `Đặt bàn` action establish the place and next step.
2. **Choose your evening.** A chronological programme shows artist, date/time, poster, and reservation action. Selecting a show carries that choice into the booking contact; mobile uses visible stacked entries.
3. **Come during the day, stay for the music.** Real venue photography and concise café/lounge copy explain the two experiences.
4. **Know what you can order.** A prominent menu preview opens the primary flipbook experience with preserved artwork, category jumps, and readable zoom.
5. **Plan the visit.** Address, verified opening hours, clickable hotlines, directions, and event-hosting contact complete the journey.

Visual direction: flat deep green and warm light surfaces, high-contrast text, large programme typography, and restrained accent colour. These are provisional choices derived from the existing repo, not verified Trixie brand standards. Start the font proof with Be Vietnam Pro, whose installed Next.js definition supports Vietnamese; check diacritics, weights, and mobile wrapping before choosing display typography. Replace repeated pills/glass/tilt effects with deliberate programme rows and large authentic images. Do not use stock photos as evidence of the venue or an artist.

Reservation behavior: begin with an honest call-to-reserve action using the verified hotline. A submitted booking form requires a real receiving workflow, validation, pending/error states, and a distinction between a reservation request and confirmed availability. Do not show a fake success state.

Retain the current routes, bilingual helpers, Supabase model, and original menu assets. Add no new animation library for the redesign. Use existing motion sparingly with reduced-motion fallbacks and keep critical content readable without animation.

## 4. Verification and next implementation order

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, exit 0. |
| `npm run typecheck` | Fail, exit 2: unsupported font subset at `src/app/layout.tsx:9`. |
| `npm run build`, sandbox | Fail fetching Google Fonts. |
| `npm run build`, with network access | Compilation succeeds; build fails TypeScript on the same unsupported font subset. |
| Taste Skill source lint over `src` | 26 files; 18 FAIL occurrences and 19 WARN occurrences. These are opinionated style findings, not 37 functional defects. |
| Taste Skill browser inspection | Not completed. The cached Chromium executable exits with missing `libnspr4.so`; no screenshots or viewport scores are claimed. |

Suggested implementation sequence: (1) fix font/build and establish real brand/content, (2) build the improved flipbook and shared site components, (3) redesign home/programme/booking contact and align secondary pages, (4) complete admin authorization/persistence separately. Before release, run production-build browser checks at 390/768/1440px, both locales, keyboard navigation, reduced motion, empty events, failed data loading, and reservation actions.

Application files were not changed. The pre-existing `.env.example` modification was left untouched.

Review references: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [Taste Skill](https://github.com/Leonxlnx/taste-skill), [Trixie](https://trixie.com.vn/), and [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).
