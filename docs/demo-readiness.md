# Demo readiness — 1 November 2026

Ready for a guided visual and content-management demonstration. The core booking-request workflow is implemented; staff confirm details and seating through the appropriate communication channel.

## Working demonstration

- Vietnamese/English public site, menu flipbook, authentic event content, detail calendars, related shows and shared seating viewer.
- Responsive public and admin views; Manrope primary typography and Great Vibes detail headings.
- Supabase-backed event creation/editing/visibility/deletion and media uploads.
- Shared seating configuration, named staff accounts and admin/editor authorization.
- React Hook Form admin forms; React Query admin/public data caching and mutations; consistent day-first date displays.

## Material limits to explain honestly

- Reservation requests are saved as pending. Staff confirm through the appropriate channel; the site does not automatically allocate or guarantee seats. In-app notifications require an open dashboard.
- Video settings persist to Supabase. New page loads use saved settings immediately; already-open pages refresh on focus or within one minute.
- Unimplemented header/footer destinations use `#` placeholders.
- Local development is not a shareable hosted sales demo. Deployment credentials/environment and a demo URL still need to be arranged.
- Public summary caches can take about a minute to refresh. A freshly loaded detail page is the clearest way to demonstrate an edited event.

## Highest-value next work

1. Demonstrate the completed booking journey: guest submission → pending inbox → staff verification → confirmed status and audit history. References are optional staff-facing lookup codes.
2. Demonstrate persisted video settings: change the heading/URL/visibility, save, then verify the public page.
3. Prepare a stable hosted demo and a separate demo staff account/data set. Check every navigation and call-to-action destination before sharing the link.
4. Rehearse a short buyer story: find an upcoming show on a phone, inspect seating, submit an inquiry, then let staff handle it and update a show themselves.
5. Show measured evidence: mobile loading/interactivity/layout stability and booking/call actions. Do not invent conversion uplift or successful submissions.

## Sales framing

Position the upgrade around easier booking inquiries and staff-controlled event updates. Present a clear delivery scope, training/handover, and an optional hosting/maintenance package. A concise old/new comparison should demonstrate the actual tasks that became easier. Avoid promising unsupported capabilities.

## Reservation workflow — 1 November 2026

The guest form now submits real pending requests after review. `/admin/reservations` supports callbacks, confirmation/closure/reopening, manual phone/Facebook/Zalo entries, filters, pending count and in-app notifications. Each successful change is recorded in the shared redacted audit log. Guest receipts never claim seat availability or confirmed bookings. References remain optional staff-facing search codes; phone search is also supported. Notifications need an open dashboard. Video settings are persisted and rendered publicly with locale fallback and visibility controls.
