# Public content review — 2 November 2026

Scope: public desktop content in Vietnamese and English. Mobile verification is deferred at the user's request. No database content was changed.

## Cleanup

- Rewrote the three homepage introduction paragraphs for clarity in both languages. Removed duplicated words, unsupported rankings and promises about artist photos/stage access, the unverified 100-main-dish/20-lunch counts and the 06:30 breakfast time conflicting with published 07:00 opening hours.
- Kept original source metadata and added an editorial review note. Imported event articles and owner-edited dates remain unchanged.
- Removed five unused prototype translation namespaces containing Lounge Brew branding, technical demo copy and obsolete admin claims. Updated menu descriptions to stop advertising the removed zoom feature, and renamed the upcoming-show section accordingly.
- Localized the header home-link accessible name and event venue address. Existing unfinished navigation remains `#` as requested; the food discovery CTA remains `/menu` while the food listing page is postponed.

## Verified

The nine live upcoming public records match the names and dates listed on https://trixie.com.vn/ on the review date: Hoàng Hải 07/11, Minh Tuyết 13/11, Nguyên Hà 20/11, Dương Edward 21/11, Quang Đăng Trần 27/11, Đỗ Hoàng Hiệp 28/11, Quang Vinh 11/12, Văn Mai Hương 18/12 and Nguyễn Kiều Oanh 19/12, all in 2026. The two hotline numbers and 165 Thái Hà address agree with the source homepage. User-edited historical records were not overwritten.

All nine event detail routes plus home, menu, events and journal returned HTTP 200 with no captured runtime errors. A second pass covered 12 desktop page views across VI/EN and fetched 107 unique displayed image/poster URLs successfully. The live public video configuration points to the previously reviewed Minh Tuyết video `gOvPXjqWn1A`; both shared seating assets are configured. Embed availability is third-party controlled; these checks do not establish successful video playback in every browser.

Dates use the existing day-first display helpers and Hanoi timezone. Original article/title date typography is preserved. The default UI locale remains Vietnamese; saved language preference is respected. Fees render from stored values with the requested zero fallback; zero is not independently verified as a no-surcharge promise.

Validation: lint, TypeScript, UI rules (zero violations), all 26 test suites and production build passed after these changes.

## Remaining editorial decisions

- Venue approval of actual event surcharges, current menu availability/prices and operating hours before public launch.
- Nguyên Hà body image: original source had a non-downloadable blob URL; user will supply the image later. No replacement invented.
- Two original archive entries have unavailable media and retain their existing unavailable state; no invented images or artist metadata.
- News/journal is currently empty in the live database. Unimplemented navigation destinations remain deliberate placeholders.
- Food listing page remains postponed. Mobile review and hosted-domain verification are separate follow-up work.

## Owner revision

Restored the three original source introduction descriptions in VI/EN at the owner’s request. Existing local links remain local/placeholders. The earlier editorial rewrites listed above are superseded. Revised hero and upcoming-show promotional copy separately, changed food introduction “rồi” to “và”, and made introduction/hero calls to action actual buttons.
