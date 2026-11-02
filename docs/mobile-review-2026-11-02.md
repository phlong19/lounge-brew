# Manual responsive review — 2 November 2026

Computer-use browser pass at 375×812 and 425×812, with a 1440px desktop regression check. This is viewport simulation with pointer/keyboard interaction, not a real iPhone/Android device test. No booking was submitted and no live records were changed. Temporary viewport override was reset and Vietnamese restored after testing.

## Tested

- Mobile navigation opening/closing, scrolling to bottom actions, VI/EN language selection and Escape dismissal.
- Menu single-page layout, previous/next arrows, grouped category selection and the desktop two-page spread.
- Homepage hero, stacked introduction and food-carousel arrow navigation.
- Upcoming event list, Hoàng Hải detail layout/calendar, booking entry and both seating floors in the expanded viewer.
- Empty booking validation, scrollable error state, event-prefilled date/time, review and return to edit. Test name/phone fields were cleared afterwards.

## Fixed in this revision

- Phone artwork previously lost substantial width to side-arrow columns and outer padding. Below 640px, arrows now sit below the artwork at opposite ends; the page uses the full available width. Measured stage width at 375px increased from 222px to 326px (approximately 47%); the original desktop spread remains intact.
- Mobile language options were aligned to the full-width wrapper rather than the trigger. The wrapper now fits the control; the mobile popover aligns to its left edge above it, and the desktop retains end alignment. Mobile uses click/tap activation without mouse-hover interference. Checked at both requested widths, including Escape dismissal.

## Remaining follow-up

- At 375px, the booking form's paired date/time fields are cramped and can clip the date text/placeholder. The calendar itself remains usable and fits the screen.
- The navigation drawer is long: booking/language actions require scrolling. Consider a fixed footer within the drawer.
- The seating viewer fits the viewport and switches floors, but its portrait layout leaves large vertical gaps around a landscape map. A compact or zoomable viewing design would improve readability.
- A pointer drag on the menu did not advance the page in this pass; arrows and categories did. Confirm actual touch swiping, pinch zoom, on-screen keyboards and Safari behavior on physical phones.
- Changing language removed the menu page query from the address while the in-memory selected page remained. Reload then returned to the cover. Follow up on locale refresh/history synchronization separately.

Validation after the two fixes: lint, TypeScript, UI rules (zero violations), 26 test suites and production build passed. Existing content cleanup changes are preserved and remain uncommitted.


## Follow-up: phone Embla and tablet navigation repair

User requested Embla on phones, without autoplay, and exclusions of original pages 1 and 17. Implemented below 640px; 640–1023px retains a single-page flipbook with all 18 faces. Desktop retains the two-page book.

Rechecked through computer use at 375×812 and 425×812: dragging forward/backward, previous/next arrows, scrolled category selection by pointer, keyboard category selection, first/last limits, and original page numbering. Confirmed page 16 steps directly to 18 and back; phone starts on page 2. Both excluded pages are absent from the phone selector and sequence. The slider remained stationary without input.

At 768×1024, confirmed animated forward and backward turns, correct settled artwork after each arrow, and an animated distant jump back to the original cover. At 1440px, confirmed two-page spreads and a distant bookmark jump settling on the requested spread. No browser error logs were captured. The library's generated page-fold transforms are retained; no DOM or CSS patches were used.

The earlier pointer-drag limitation is resolved on phones by Embla. The earlier language-refresh query loss is also resolved: switching VI→EN→VI retained `/menu?page=3` and the selected artwork. Original physical phone touch gestures, Safari and on-screen keyboard behavior still require physical-device checks. The earlier date-field and seating-viewer design findings remain separate follow-up items.

After implementation, lint, TypeScript, UI rules, all 26 test suites and production build passed. Added regression cases for phone exclusions, boundary navigation, original URL numbers and filtered bookmark identities. No database mutations, commits or pushes were made in this revision.
