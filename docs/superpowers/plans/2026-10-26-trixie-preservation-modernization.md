# Trixie: preserve the structure, modernize the presentation

26 October 2026 · Approved rollout implemented and verified; see 2026-10-26-trixie-restoration-review.md.

## Corrected brief

Use https://trixie.com.vn/ as the source of truth for the homepage's section order, content groups, navigation, and purpose. Modernize each section in place. Do not replace the original information architecture with a new editorial landing page, combine distinct sections, or retain only a few attractive items from a collection.

This supersedes the earlier homepage composition in the redesign specification. The repository's primitive, Tailwind, accessibility, translation, authentic-image, and original-menu-artwork requirements remain in force. Taste and UI UX Pro Max guide presentation and usability within the preserved structure; their generated page formulas do not determine the content or section order.

## Verified source order and modernization plan

The live homepage and its rendered accessibility tree were inspected. The quick-booking overlay is a separate entry point, not the first inline content section. The inline order is:

| Order | Original section | Preserve | Modernize in place |
| --- | --- | --- | --- |
| 1 | Header and navigation | Logo; home, menu, services, events, albums, video, contact, and news; existing submenu destinations; venue/contact access | Cleaner spacing and typography; accessible dropdowns and mobile navigation; an unobtrusive quick-booking entry. |
| 2 | Hero image slider | Opening image-led slider and its position | Keep the full-width carousel, clickable progress segments, smaller heading, and lower copy position already requested. Use the original hero assets; do not substitute food items or historical show posters for the opening content. |
| 3 | Mini show mới | Full current source collection, original links, artists, dates, and order | A responsive poster carousel with readable artist/date captions below images. All valid items remain reachable; remove the current four-item homepage truncation. Keep past shows separate. |
| 4 | Quán cafe nhạc sống Trixie | The three distinct blocks, in order: Quán cafe đẹp nhất Hà Nội; Nhạc sống cùng thần tượng; Phòng trà ca nhạc | Preserve the alternating image/text layout and each block's subject. Improve line length, heading hierarchy, image proportions, and mobile stacking. Edit repetitive wording faithfully without collapsing three blocks into two lifestyle panels. Flag outdated factual claims for verification. |
| 5 | Food and drink image wall | All distinct original products, their names, photographs, descriptions where present, and detail links | Replace the dense wall in the supplied screenshot with a product carousel: large photos, names below the photos, short descriptions, and clear detail links. Show several items on desktop and one readable item on mobile. Include category navigation if useful without hiding or deleting products. Preserve original sequence and original artwork; no text baked over photographs. |
| 6 | Đặt bàn | Dedicated booking section after the food collection; event selection, name, phone, email, date, time, seats/guests, and notes | Reuse the new form primitives and validation, restore the missing source fields, and keep this as its own section. The user explicitly requested UI and validation only: no endpoint, persistence, sending, fake confirmation, or claimed availability. Quick-booking entries lead here. |
| 7 | Video quán Cafe Trixie Hà Nội | The video section and original content destinations | A clear featured video/poster and readable clip navigation. The currently embedded primary YouTube video reports that it is private; retain the section with a truthful unavailable state unless a working, authentic replacement is verified. Do not silently remove the section or invent footage. |
| 8 | Historical minishow image strip | The original archive collection and its position below video | An accessible archive carousel with readable names/dates and original destinations where available. Clearly separate historical performances from upcoming bookings. De-duplicate slider-generated clones, not distinct source entries. |
| 9 | Footer: venue and social | Venue identity, address, hotlines, hours, and both separate Trixie Cafe and Trixie Lounge fanpages | A compact, readable footer with two distinct social destinations/cards. Keep contact information together here rather than merging it into the reservation section or repeating another full contact block. Preserve supported social destinations; do not carry over placeholder links. |

The full 18-page flipbook remains at `/menu`. The current standalone homepage menu-spread section should stop displacing the original content sequence: restore the food/drink collection in its proper slot and link from it to the flipbook. Keep the menu artwork static and joined, with no hover transforms.

## Map the current implementation to the restored page

| Current implementation | Corrective action |
| --- | --- |
| `HeroCarousel` | Retain the agreed interaction and copy placement; audit its assets against the original opening section. |
| `HomeExperience` | Replace with the source's complete three-block introduction and move it after the minishows. |
| `HomeShows` and `.slice(0, 4)` | Reuse event data and routing, restore the full collection, and put it immediately after the hero. |
| `HomeMenuPreview` | Replace its homepage slot with the original food/drink collection carousel; retain the full menu viewer and its navigation. |
| `HomeVenue` and general photo slider | Do not use this as a substitute for food, introduction, video, or archive sections. Reuse the slider interaction with the correct source collection; put general album content behind the original album navigation. |
| `VisitSection` containing contact and form | Split into the dedicated reservation section and the original footer/contact region. Restore reservation fields omitted from the source. |
| Missing video/archive content | Restore both as distinct sections after booking, in the verified original order. |
| Simplified header/footer navigation | Restore the omitted original destinations and the two separate fanpage identities. |

## Implementation sequence

1. **Create a content-parity inventory.** Record each source section and item with its title, order, asset, destination, description, and current local counterpart. Record inaccessible/outdated content explicitly. Inventory the full food collection, full upcoming-show collection, form fields, video references, and unique archive items. Avoid copied carousel clones.
2. **Restore structure before visual polish.** Compose the homepage in the verified order, with one component per original section. Remove invented replacement sections from the homepage. Keep all content reachable before adding motion.
3. **Modernize one section at a time.** Header/hero → minishows → all three introduction blocks → food/drink carousel → reservation → video → archive → footer. For each, compare the source and local page together for content parity, then check desktop and mobile presentation.
4. **Reconnect navigation and interactions.** Preserve original destinations, working detail links, category/item access, keyboard navigation, touch targets, focus restoration, and reduced motion. Keep reservation behavior local-only.
5. **Run a final parity and visual audit.** Check exact section order; every source collection remains accessible; no missing form fields; original destinations resolve or have an explicit fallback; no fabricated content. Then check both languages at 390/768/1440px and run lint, TypeScript, UI rules, tests appropriate to changed behavior, and a production build.

## Review checkpoints

- First deliver the source-to-local content inventory and a plain section-order outline.
- Review the restored content structure before applying a new visual treatment across it.
- Compare each finished section with its original, identifying exactly what changed in presentation.
- A good-looking screenshot does not count as complete if content or a section disappeared.
- Do not publish or commit without a separate instruction.

## Immediate corrections in this planning turn

- Remove opposing hover translations from the two menu images so they stay joined.
- Remove “Programmes may change. Please call before your visit.” and its translated display from home, events, and show details.
- Keep the user's earlier removals of the original-language explanation and original-page-count label.
- The user subsequently authorized the goal and section-by-section implementation.

Source: [Trixie homepage](https://trixie.com.vn/), inspected on 26 October 2026, including its rendered navigation, inline reservation form, food collection, video state, archive strip, and two fanpage blocks.

## Rollout clarification

Fresh source DOM inspection confirms booking and video occupy the same desktop row (source columns 5/7), with booking first in document/mobile order. The implementation preserves this relationship. Original service, offer, album, video, contact, and news destinations remain external; home, menu, and upcoming shows use their local equivalents. The inventory records two unavailable archive images and one private video explicitly.
