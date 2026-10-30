# Food grid carousel with hover details

Implemented 30 October 2026. The food section retains its heading and one link to the original flipbook, and presents all 21 authentic Trixie items in source order without category tabs or a bottom expansion action.

## Layout and movement

- Consecutive items form two-item columns. Desktop shows four columns and advances two; tablet shows two and advances one; mobile shows one and advances one.
- Side arrows have reserved space. Touch dragging, arrow keys, Home and End are supported. Navigation stops at each end, with disabled arrows. No autoplay or counter.
- The final column contains only the last real item. No duplicates or placeholder dishes are added.

## Details

- The same bilingual description appears on the card and in its detail popover. Titles use their natural height, capped at two lines; descriptions reserve two lines and use ellipsis. This keeps title-to-description spacing compact.
- Copy uses factual summaries of Trixie's product information, with English equivalents. It retains original images and links in the source dataset, and adds no prices, availability or health claims.
- Moving the mouse within a card opens an immediate cursor-following preview. It passes pointer events through, so adjacent cards remain available even beneath the preview. Leaving the card closes it; a stationary mouse does not reopen details after dismissal. Keyboard focus opens stationary details; clicking or tapping any part of a card navigates to its initial detail page at `/menu/[id]`.
- Rich details are portalled through an owned non-modal Radix popover with image, title and full description. Keyboard details expose the interactive close action; cursor previews are non-interactive. Escape closes and restores trigger focus; outside interaction dismisses without stealing focus from the clicked control.
- Radix positions cursor previews through a stable virtual anchor, using its documented positioning engine rather than owned inline styles. Previews use side placement on desktop and above/below placement on smaller screens, with collision handling. Keyboard details support bounded scrolling. Navigation dismisses current details.
- A darker thumbnail overlay with a centered eye icon follows card hover/focus without moving or resizing the image. Side arrows use a pointer cursor and solid emerald hover/focus feedback. The preview uses a light sage green surface with dark text, a 12 px image-to-text gap and a 4 px title-to-description gap.
- Initial food detail pages reuse the same bilingual source image, name and description, with links back to the dishes and the full flipbook. Unknown IDs return 404; these initial pages are excluded from indexing.

## Technical boundaries and checks

Owned UI uses reusable primitives, Typography and centralized Tailwind styles. The existing shows autoplay and archive auto-scroll remain supported by the shared Embla adapter. This change adds no database schema or booking behavior.

Checks: lint, TypeScript, UI rules, existing automated test suites and production build. Browser validation covers VI/EN at 390/768/1440px; visible item counts, step distances, boundaries, hover, keyboard, card navigation, touch swipe without accidental navigation, full descriptions and viewport containment.
