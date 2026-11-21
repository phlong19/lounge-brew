# Poster-derived ticket colours

## Implemented — 9 November 2026

- Server-side Sharp sampling during event image upload/import, using existing validated bytes; no public rendering fetch/canvas or third-party colour service.
- Background/edge-weighted hue voting, with central warm portrait pixels downweighted. Neutral/transparent sources safely fall back to charcoal. Bright backgrounds select a lighter paper stock.
- Twenty static Tailwind paper/ink/stripe combinations. Every paper/ink pair passes WCAG 4.5:1 normal-text contrast. Generated metadata selects a validated key; no authored inline colours or CSS variables.
- Store extraction version and SHA-256 hash on `media_assets`; copy the palette key to `events`. Cover changes reset to the new asset's palette via a database trigger. Admin cover resolution also copies the key when reusing an existing image.
- Public event summaries include the key directly, without media joins, extra queries, downloads or extraction during page loads. Both card variants share the existing event query. Tickets have a neutral fallback instead of assigning unrelated index-based colours.
- Backfilled all 12 currently upcoming covers. Confirmed authenticated R2 object access and public delivery by matching SHA-256 checksums. Existing content and cover URLs are preserved.
- Similar poster themes can legitimately share a palette. Hue recognition is deterministic quantization, not semantic AI; unusual art can require a future editorial override.

## Realistic ticket decoration — proposed next revision

1. Keep the theme drawn from the poster, with a quieter paper stock and one stronger ink/accent colour; review actual posters together before expanding palettes.
2. Use a restrained paper grain, slight edge wear and subtle stamped ink rather than glossy effects. Reduce the broad reflective sweep; keep effects inexpensive and disable motion for reduced-motion users.
3. Align side punches to one perforation line and make the detachable bottom stub visually consistent. Consider a shallow repeated cut edge through an owned primitive using static Tailwind classes, without dynamic SVG/CSS injection.
4. Retain Great Vibes for artist names and condensed printed typography for factual metadata. Improve small-label spacing and align dates/times across cards without forcing identical title line counts.
5. Use genuine venue/date/time information only. Do not invent seat/row numbers, admission status or scannable barcodes. A barcode/QR should exist only when a real destination or booking validation flow is implemented.
6. Review on phone/tablet/desktop, with long multi-artist names, and check text contrast, poster crop and subtle decorative mark placement. Keep the preserved normal-card switch for comparison.

The more realistic decoration remains a plan; automatic cover colour recognition is now active.

## Editor colour control and compact proof

The event drawer now uploads the selected cover immediately, reuses its returned media ID/URL on Save, and fills the detected palette. The colour selector sits above additional fee; it remains disabled until a stored cover and detected palette exist. Editors may select another of the twenty static palettes, or reset to the detected one. Replacing/uploading a cover clears the manual override. `20261109020000_ticket_palette_override.sql` keeps the editor selection separate from the generated palette so Reset remains lossless. Public event summaries carry the effective key directly.

A horizontal ticket proof (approximately 164px high) shares the palette, fonts, poster, artist and venue-local date/time. Changes are local until Save. Native arbitrary-colour input is awaiting the user's decision on extending the Tailwind-only exception; this version uses only static Tailwind palettes.

Verified in an unsaved draft: disabled without a cover, immediate upload of an existing R2 image, auto-fill, manual palette preview, reset, and automatic reset after uploading a cover again. No test event was saved.

## Native colour override — implemented 9 November 2026
The event editor now uses the browser colour picker for any six-digit hex colour. It reuses the existing nullable ticket_palette_override text field, preserving legacy palette keys. Uploading a cover clears the override; Reset restores detected stock. A single validated TicketPaper primitive applies the approved background/ink exception, choosing black or white for AA contrast. No schema change or extra public query is needed.
