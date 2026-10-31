# Primary typeface

Manrope replaces Be Vietnam Pro across public and admin UI. The Next.js font loader self-hosts Latin and Vietnamese subsets with weights 400, 500, 600 and 700 and display: swap. Google Fonts metadata explicitly includes Vietnamese: https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/METADATA.pb

The related-events banner inherits the primary sans-serif face and aligns left. Preserved poster artwork and editorial text are unchanged. All authored styling remains Tailwind classes; no custom font stylesheet was introduced.

The reservation dialog uses a single visible heading, Thông tin đặt bàn / Reservation details. The review step keeps its programmatic focus announcement visually hidden to avoid repeating the heading. The review action aligns to the right on mobile and desktop.

Verified lint, TypeScript, UI source rules and production build. Browser checks loaded Vietnamese glyphs in Manrope, verified public/admin font families, left-aligned banner, right-aligned review action and single booking heading, with VI/EN layouts at 390/768/1440px and no browser runtime errors.

## Event detail headings — 1 November 2026

Great Vibes is the selected accent face for the event-detail h1 only, loaded through next/font/google with Latin/Vietnamese subsets, weight 400 and display: swap. Manrope remains the primary face elsewhere. The Tailwind heading variant uses normal weight, normal tracking and responsive 36/48/60px sizes.

src/lib/events/title.ts normalizes presentation text to NFC, lowercases with the current locale and capitalizes the initial letter of each word, including words after punctuation. Imported uppercase titles, stored content, metadata and other event cards are unchanged. Display example: Thứ Sáu [30.10.2026] Minishow Phương Linh.

Verified lint, TypeScript, UI rules, 23 test suites and production build. Browser checks on the selected show verified Vietnamese Great Vibes glyph loading, title-case output, retained source titles, Manrope body/sidebar, VI/EN and 390/768/1440px with no overflow or browser errors.
