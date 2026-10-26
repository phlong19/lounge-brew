# Trixie preservation rollout — completed 26 October 2026

The homepage now follows the original Trixie structure. Taste and UI UX Pro Max were applied to presentation, legibility, responsive layout, and interaction within that structure. No commit or publication was made.

## Section audit

| Original group | Implemented result | Evidence |
| --- | --- | --- |
| Header | Eight original top-level destinations, services/events children, mobile sheet and desktop disclosures | Source navigation inventory; browser checks found all 12 destination links on mobile and verified Escape/focus return on desktop |
| Hero | Full-width authentic venue carousel; smaller heading; lowered copy; three clickable progress chunks | Both locales/three widths; selection, arrow keys, autoplay, pause/resume and reduced-motion change tested |
| Upcoming minishows | All nine currently verified upcoming source shows, without the old four-item limit | Rendered item inventory, poster captions/dates, carousel start/end/next checks |
| Introduction | All three source blocks, alternating images/text on desktop, stacked on mobile | Source IDs matched in order; six full-page screenshots reviewed |
| Food/drinks | All 21 distinct products in original order; static photos with readable captions and source detail links | Exact rendered IDs match inventory, local authentic images exist, carousel access checked |
| Booking/video | Same desktop row; booking precedes video on mobile | DOM order and six responsive renders |
| Reservation | All eight original field types, current programme choices, optional email, inline validation and focusable error summary | Validator tests; browser tests blank/invalid email, programme/date fill, review/edit focus; zero POSTs during form flow; no-JS review disabled |
| Video | Private-video fallback with original watch and collection destinations | Original private state retained explicitly, no fake play control |
| Archive | All 26 original entries, including two explicit unavailable-image entries | Exact source order/IDs, local images, carousel start/end/next checks |
| Footer | Venue/address/hours/both phones and two distinct original fanpages | Rendered fanpage count/destinations; one consolidated homepage contact region |
| Full menu | Existing 18-page original-artwork flipbook retained at /menu | Unit menu-state tests; both locales/three widths keyboard, zoom, Escape/focus-return and overflow regression checks |

## Validation

- Final `npm run verify`: lint, TypeScript, owned UI rules, 58 tests in 11 suites, and production build passed. UI rule checker: zero violations. `git diff --check` passed.
- Production browser matrix: English and Vietnamese at 390, 768 and 1440 pixels. Exact content/order checks, carousel access, reservation validation/review/edit, navigation dismissal/focus, no page overflow, no broken loaded images, no page JavaScript errors. No reservation submission requests.
- Hero/menu production regressions passed, including automatic hero progression, pause/resume, reduced motion, menu keyboard navigation and zoom-dialog focus return.
- Taste source lint: zero failures or warnings. Final production inspector: zero failures, four documented warnings below.
- No custom CSS, inline styles or new feature-level native tags; new interactions compose owned primitives. Admin persistence/auth behavior was not changed. Build-generated next-env.d.ts was restored to its pre-build state.

## Visual review

Reviewed full-page English/Vietnamese renders at all three widths. The authentic live stage leads the page; dark minishows, alternating white introductions, stone food section, booking/video row, archive and dark footer keep the original sequence legible. Poster artwork uses contain; food/archive photographs use consistent crops with captions below, avoiding the original unreadable text overlays. Mobile uses single-item carousel views and a scrollable navigation sheet.

Round-one fixes: reduced excess blank space in social panels; normalized archive display capitalization while retaining source titles; refined single-item carousel counters. Round two confirms these changes in the final production screenshots.

Fourteen-pass critique: clear stage focal point and booking action; coherent dark/light masses; real venue imagery carries identity; shared page edges; alternating source blocks retain their intended spacing; balanced bilingual headings; green/cream brand with stone food background; authentic images throughout; repeated carousels deliberately serve three separate source collections; phone crops/controls are readable; all groups are populated; full source collections remain reachable; no collisions/overflow; programme choice and local review provide the useful live interaction.

Self-review score: design 7.5, usability 8, creativity 6.5, content 8; weighted 7.5/10. This is a preservation-focused modernization, with the original source structure taking precedence over an unrelated gallery template.

Inspector warnings retained deliberately:

1. Cream palette: retained Trixie brand/menu cream; food uses the requested low-chroma stone background.
2. No footage: the original video is private; substituting unrelated stock footage would misrepresent the venue.
3. Side-scroll rows: the user requested carousels; visible counters and previous/next controls accompany keyboard/touch-native scrolling, with no page-level overflow.
4. Empty-middle: inspector treats the full offscreen carousel tracks as page geometry. Reviewed screenshots show populated in-frame columns; all three collection rows stay inside the same container.

## Source limitations and preview

Two original archive images return 403 and have no source artist/date title. Their entries remain visible with an unavailable-photo message and the original album-index destination. The source programme selector contained a stale 2021 show; the form uses only the nine verified upcoming shows. Old intro claims about opening before published hours, exact catalogue counts and resting beds were not reasserted as current facts.

The Windows session cannot reach WSL loopback ports directly. A session-only loopback bridge now serves the verified production build at http://127.0.0.1:4000/ and was opened and visually confirmed in the in-app browser. The bridge changes no firewall, WSL settings or repository code. Its two helper scripts live in workspace work/; the production server remains on WSL port 3011. The dev server remains separate on WSL port 3000.

## Follow-up: library carousel — 26 October 2026

Replaced the three native horizontal-scroll rows with Embla Carousel React 8.6.0, the engine used by shadcn. Controls and page counts now sit beside each section heading, and desktop navigation advances a full visible group. The viewport hides native scrollbars once initialized; touch/mouse dragging, keyboard arrows/Home/End, disabled end controls, responsive sizing and reduced motion are supported. Offscreen slides become inert based on Embla visibility events. All 9 shows, 21 products and 26 archive entries remain in source order. The hero progress chunks are unchanged.

The narrow third-party runtime-transform rule is documented in AGENTS.md; authored layout remains Tailwind-only and native tags remain confined to the owned UI adapter. No engine DOM/style patching or broad rule exemption was added.

Final validation: npm run verify passed (lint, TypeScript, UI source checks, 58 tests, production build); git diff --check passed. A new production browser matrix passed in English/Vietnamese at 390/768/1440px, checking grouped navigation, first/last reachability, heading controls, hidden scrollbars, no page overflow and no browser exceptions. A normal-motion mouse-drag test passed. The live preview at http://127.0.0.1:4000/ was refreshed and confirmed to contain three Embla carousels. No commit or publication.


## User-requested archive simplification and commit

The user subsequently requested removing individual archive photograph links/new-tab actions and committing all repository changes. Archive entries now show only their photo (or unavailable state), title and verified date; the section-level album collection link remains. Source URLs are retained in the inventory for provenance. This supersedes the earlier per-item destination presentation and the earlier instruction to leave changes uncommitted.
