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
