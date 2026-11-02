# Menu viewer revision — 2 November 2026

This revision supersedes older menu-specific zoom/expand/counter requirements. The 18 authentic local page images and their order are retained.

- The exact texture at https://trixie.com.vn/templates/site/images/debut_dark_tile-bg.jpg is saved at public/trixie/debut_dark_tile-bg.jpg and repeated through a Tailwind background utility. No new stylesheet or inline styling is authored.
- Desktop always uses the two-page engine, including the covers. Front cover occupies the engine's right half; a -25% frame translation centers its visible page. Opening transitions to zero translation as the cover turns. Back cover uses the corresponding +25% centering. The engine does not remount just because a cover opens/closes.
- Side arrows, category bookmarks, deep links, keyboard controls and narrow-screen single pages remain. The custom zoom/expand dialog and visible page counter are removed.
- Pointer fold events provide a motion target during cover dragging; aborted folds restore the current layout. Owned transforms use complete Tailwind classes. Only the existing engine writes its internal page-turn styles.
- Menu title and event detail titles share scriptHeadingFont (Great Vibes with Vietnamese support). Removed the introductory description and artwork disclaimer from the public menu page. Menu main content no longer reserves a full blank viewport beneath a short viewer.
- Reduced motion renders the same artwork/page layout directly without the page-turn engine or translation animation. No-JavaScript visitors retain original-page links.

Validation: desktop cover and interior page frames both measured 450 × 625.90625px at a 1440px viewport. Engine DOM identity remains unchanged through front-cover opening/closing. Checked arrow/drag closing, category bookmarks, back cover, URL targets, keyboard, reduced motion and responsive layouts in Vietnamese/English. Unit/build results are reported in the task completion, not assumed here.

## Original-site observations

Inspected the HTML of https://trixie.com.vn/thuc-don.html, https://trixie.com.vn/menu-trixie.html and https://trixie.com.vn/do-uong.html. Their source references jQuery 1.11.1, Bootstrap CSS/JS, Slick, Nivo Slider, Remodal, Font Awesome and jQuery datetimepicker. The flipbook page additionally loads a site-specific flipbook.js. A stylesheet is generated through templates/site/css/style.php?banner=banner.jpg. Responses are served through Cloudflare.

These are observations, not proof of the whole backend. A traditional server-rendered PHP/template CMS is a reasonable inference; its exact CMS/framework, PHP/database versions and origin server are unverified. Static-looking pages can still be generated from a CMS database. The menu artwork and older item catalog should not be assumed to share a single current data source.

Follow-up: grouped bookmarks cover wine/spirits, snacks/beer/fruit, food divider/appetisers, and beef-pork/chicken. Mobile and desktop share grouped targets while preserving all 18 page images and URLs. Navigation controls lock during a page turn to prevent overlapping requests landing on the wrong spread. Arrow backgrounds are pale for contrast against the texture.


## Phone/tablet revision after manual testing

Below 640px: controlled Embla paging without any autoplay/auto-scroll plugin. Exclude physical indices 0 and 16 (original pages 1 and 17), preserving original page numbers in links and bookmarks. The first phone page is original page 2 and the last is original page 18. Arrows, keyboard navigation, swipes and category jumps share one selected physical page; unavailable deep links normalize to the next available page.

640–1023px: retain all 18 pages and portrait page flipping. The corner-only click setting rejected the engine's synthetic backward-turn point after `flipToPage` had already moved its internal spread index. Portrait now allows directional turns. Navigation animates from the actual current page via `flipNext`/`flipPrev`; a distant category target settles through `turnToPage` after the animation ends. Displayed-page context remains stable while turning so requested targets do not replace the outgoing page midway.

1024px and above: retain the two-page book, constant desktop page dimensions, centering animation and bookmarks. Reduced-motion behavior remains supported. Browser-history writes use Next-compatible state so language refresh does not drop the selected page query.

Embla is isolated in the owned UI carousel adapter. Its resize/reinitialization events cannot become user navigation; only drag selections notify the parent, while arrows/category/keyboard actions update the controlled target. No authored styles or library-DOM patches were added.


### Tablet exclusions revision

The user extended exclusions of original pages 1 and 17 to tablets. All viewports below 1024px now use the same 16-face sequence; phones use Embla and tablets retain portrait page flipping. Desktop continues to use the complete 18-face book. The tablet engine receives dense local indices, mapped back to the original physical indices for URLs, category bookmarks, arrow navigation and reduced-motion fallback. This prevents skipped pages from appearing during flips or causing an off-by-one mismatch.


### Live controls and mobile hotline

Arrows, keyboard navigation, category dropdown and bookmarks remain enabled during flips and held-page gestures. The adapter retains the latest requested destination and settles on it when the engine returns to its reading state; only book boundaries disable arrows. Rapid keyboard reversal and desktop category changes were verified in the browser.

Below 768px the announcement bar uses a phone-icon dropdown containing both tap-to-call numbers. Tablet and desktop keep the full hotline row. Verified at 375px and 768px. Lint, type checking, UI rules, all 26 test suites and production build passed.
