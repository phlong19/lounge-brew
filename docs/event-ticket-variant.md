# Event ticket comparison

Branch: feat/event-ticket-cards, based on main merge 6758285. Existing work committed as b52188c.

The original HomeShows carousel remains. A ticket carousel follows directly below, using the same localized event array and existing public query result without another observer or fetch. Real posters, venue-local show dates and times are retained. Ticket colours, notches, perforations and decorative barcodes use Tailwind classes. Barcodes are hidden from assistive technology and do not represent issued admission tickets or invented seats.

Verified VI/EN labels, desktop four-column, tablet two-column and phone single-column layouts; no horizontal document overflow at 375/768px. Checked arrow/keyboard/indicator navigation. Lint, TypeScript, UI rules, 26 test suites and production build pass.

Revision: dark forest section, muted ticket stock colours, Great Vibes artist names and monospaced printed details. Reduced header/stub spacing and poster width for shorter cards. Inverse pagination dots preserve contrast. Verified Great Vibes renders on phone, no document overflow at 375px, and production build passes.

## Printed revision, 3 November

Supersedes the script-name/barcode iteration. Barlow Condensed 400/600/700 is loaded through next/font with Vietnamese support (Google Fonts metadata: https://github.com/google/fonts/blob/main/ofl/barlowcondensed/METADATA.pb). Printed-ticket hierarchy was informed by https://www.cooperhewitt.org/2014/08/22/tickets/. Labels are 12px, series/venue 14px and date/time 20px. White poster frames were removed; posters fill consistent windows using object-cover, with minor edge cropping to reconcile source proportions. The decorative barcode has been removed in favour of an explicit event-detail action. The current nine shows have nine distinct stock colours against a near-black green background. No new data queries.

Verified Barlow Condensed in browser, all nine computed background colours distinct, all poster windows filled, and no horizontal overflow at 375/390/768/1440px. Lint, types, UI rules and production build pass.

Latest owner revision: Great Vibes restored for artist names at 36px, Barlow Condensed retained for printed details. Poster-matched stock/accent stripe pairs are keyed by public event ID, preserving colour identity across ordering changes. Nine current colours remain distinct. Subtle white diagonal lines and decorative registration crosses use Tailwind classes only. Browser verification confirms Great Vibes, generated texture, nine unique colours and no horizontal overflow at 390/768/1440px. Production build passes.
