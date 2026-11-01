# Reservation request flow — 1 November 2026

## Agreed decisions

- One pending request per normalized phone, not a lifetime phone ban and not a limit per show/date.
- Vietnam-only operation: visit_date + visit_time mean venue local time. Asia/Ho_Chi_Minh is a fixed application setting, not a reservation column. Technical/audit instants remain timestamptz.
- One shared queue, without assigned_to. The actual actor of each change remains in audit_log.
- One application audit table, including reservation history. No duplicated contact details or secrets in history.
- Staff confirm a request after verifying its details and seating through the appropriate channel. A callback is optional: an inbound phone call or an already trusted social conversation can be sufficient. The public site never promises an available seat automatically.
- Phone/social bookings are a first-class staff-entry path; they do not need to start on the website.

## Delivered foundation

Server Auth administration reads SUPABASE_SECRET_KEY, requires sb_secret_ format and has no legacy-key fallback. Ordinary SSR/data reads and staff database writes keep the publishable/user-session clients and RLS. Staff creation still requires an active admin; later password changes and account deletion must use the same guard and admin client.

Migration 20261101000000 removes venue_timezone and assigned_to, introduces pending status and source, generates a canonical phone, enforces one pending request atomically, shortens new reference defaults, and consolidates audit streams. All existing audit history is retained. There were no live reservation rows during deployment.

reference is a short human lookup label for staff and optional guest follow-up. UUID id is the relational identifier; idempotency_key is a stable token for retries of one form submission. None is a substitute for staff authorization. No public lookup of contacts by reference or phone is planned.

## Delivered guest journey

1. Open an event or general booking form. Choose programme/visit date/time, name, phone and party size; email and notes remain optional.
2. Review details, then explicitly choose Gửi yêu cầu. A React Query mutation posts to POST /api/reservations with a stable idempotency key for that attempt. Keep entered values and retry token on network failure; do not cache contact data in public queries or persistent browser storage.
3. The server whitelists fields, rejects caller-supplied status/actor/source, validates local date/time/opening hours and current event visibility/start/date, normalizes phone consistently with the database, and applies per-origin/IP request limits plus a honeypot. Phone formatting alone cannot prove ownership or stop someone using many different numbers. Additional bot checks can be added if abuse warrants them.
4. A server-only insert writes pending + source website. The database unique index prevents concurrent pending submissions using the same phone even with different formatting. Idempotency retries return the same submission outcome; a reused token with changed content is rejected. A second pending request does not expose the existing reference, contact details or status. Use a neutral receipt/awaiting-confirmation response so the endpoint is not a phone-number lookup.
5. Only after successful persistence/idempotent receipt show: Yêu cầu đặt bàn đã được ghi nhận. Nhân viên Trixie sẽ kiểm tra và xác nhận đặt bàn. An actual write failure remains an error, with the form available for retry. The reference can remain staff-facing in this first flow.

## Delivered staff journey

- Add Đặt bàn to admin navigation, with a pending count. Default queue is pending, oldest first; filter by date, programme, status and source. Name/phone search is authorized staff-only; references are not searched.
- Open a drawer with programme, date/time, party size, contacts, guest notes and shared audit history. Offer a click-to-call link; no automatic calls/messages are sent.
- Staff confirm details/seating by phone or the appropriate trusted communication channel outside the website's informational seating-map viewer.
- Staff choose Xác nhận, Từ chối, Hủy or Không liên hệ được. Pending becomes confirmed/declined/cancelled/unreachable; confirmed can be cancelled. A closed request can be reopened only if it does not conflict with another pending request for that phone. The API enforces these transitions and use expected updated_at to reject stale updates.
- Treat failed contact attempts as unreachable after the venue's chosen retry practice. Leaving it pending indefinitely would keep that phone blocked. Closing it frees the phone for a future legitimate request. Optional call-attempt history can be a controlled, redacted audit action.
- For Facebook, Zalo or telephone bookings, staff create an entry with the appropriate source. If the phone or social conversation already confirmed the booking, staff may create it confirmed; otherwise pending. It enters the same queue/history, not a second booking system.
- There is no assignment or claim field. Staff coordinate calls operationally; optimistic concurrency protects status writes but cannot prevent two people calling simultaneously. Add live presence only if real usage shows it is needed.

## Status vocabulary

| Stored status | Staff label | Meaning |
|---|---|---|
| pending | Chờ xác nhận | Received, awaiting a staff decision |
| confirmed | Đã xác nhận | Staff spoke to the guest and confirmed |
| unreachable | Không liên hệ được | Closed callback attempt; not confirmed |
| declined | Từ chối | Invalid/unwanted/unfulfillable request |
| cancelled | Đã hủy | Guest or venue cancelled |

## Delivered in-app notifications

Use a staff-authenticated Supabase Realtime subscription for reservation inserts/updates, then invalidate the React Query queue and count. Show an in-app badge/toast, not a fabricated booking confirmation. Recheck on focus/reconnect and keep a modest polling fallback. Migration 20261101010000 enables the reservation publication with RLS intact. Subscriptions require staff authorization. No email, social messages or browser push are sent. Notifications require an open dashboard; polling rechecks every 30 seconds and on focus/reconnect.

## Shared audit contract

Use audit_log filtered by table_name=reservations and record_id for the drawer history. Database triggers record entity changes in the same transaction, including status before/after, authenticated actor and timestamp. A failed business write must not produce a successful action log. Reservation snapshots omit name, phone, normalized phone, email, notes and idempotency_key; changed field names can still indicate a contact correction. Staff can read booking history, admins can read all application history, and browser writes to audit_log are denied.

Later Auth password/delete endpoints should validate the requesting admin, perform the operation through the secret-key client, then append an allowlisted success event on the server through the privileged client, with actor_id taken from the verified requester rather than the submitted payload. Do not log password values, hashes, session tokens or keys. Before adding hard deletion, preserve historical actor identifiers/display labels independently of the Auth account: the current actor foreign key becomes null when that account is deleted. Deactivation is the available safe first step until the deletion workflow handles this. Provider-owned auth.audit_log_entries remains Supabase's responsibility; audit_log is the unified application/business history.

## Implementation and acceptance

1. Foundation (done): secret key, deployed schema, common audit, pending-phone rule, permissions and generated types.
2. Public submit endpoint and form mutation (done): real receipt, idempotency, abuse limits, error handling and no contact enumeration.
3. Staff queue/drawer/manual-source entry and controlled status actions (done), with concurrency conflict handling.
4. In-app notifications/reconnect handling and an end-to-end test (done): submit → visible pending request → staff confirmation → shared audit event.

Tests must cover anonymous contact/history denial, non-staff denial, inactive staff, correct staff attribution, normalized duplicate phones, returning guests after closure, idempotent retries, no confirmation on server failure, conflicting staff updates, and no contact/secret data in public responses or audit snapshots. Phases 2–4 are implemented. Public receipts remain pending, never automatic confirmation.

## Verification of the foundation

Migration and permission tests first ran in a rolled-back transaction, then passed again against the deployed schema with all fixtures rolled back. All 81 existing audit payloads/IDs were fingerprint-checked and preserved; reservation count remained zero. Tests covered local/+84/0084 duplicate phones, idempotency uniqueness, returning guests after closure, staff confirmation attribution, contact-data redaction, non-staff/anonymous denial, and browser audit-write denial.

Lint, TypeScript, UI rules and all 24 test suites passed. The production build passed on retry after a transient Google Font download failure. Configured admin and staff accounts signed in, the new secret key performed authorized Auth admin reads, and live API checks returned 200 for admin staff management and 403 for ordinary staff. Client build and versionable-file scans found none of the configured server secrets or account passwords.

## Workflow implementation and operations

Migration `20261101010000_reservation_workflow.sql` adds a service-only atomic submission RPC, private hashed rate buckets, seven-day submission receipts, lifecycle guards and the Realtime publication. The public route validates/normalizes input, derives the event UUID and invokes the RPC with the new server secret. Existing receipts are checked before changing availability rules, so a legitimate retry can still succeed after an event becomes past or hidden. New requests must pass venue-local future-date/event validation inside the same transaction. No raw IP addresses are saved.

Public limits are eight requests per trusted IP per 15 minutes and three attempts per normalized phone per hour. When a trustworthy IP is unavailable, a shared bucket allows 60 requests per 15 minutes. Vercel supplies its trusted proxy context automatically. Other deployments must explicitly set `RESERVATION_TRUST_PROXY=1` only behind a proxy that replaces incoming forwarding headers; otherwise attacker-supplied `X-Forwarded-For` is ignored. These limits supplement the one-pending-phone constraint and basic honeypot; they do not prove phone ownership.

The staff queue is `/admin/reservations`, with status/source/date/programme filters and staff-only name/phone search. It defaults to oldest pending requests first. Detail drawers expose contacts, a click-to-call link, controlled status actions and redacted audit history. Status writes check the previous `updated_at`, and SQL guards also enforce the lifecycle. The legacy active booking role can access this queue without content-management or staff-management access. Admin/editor roles retain both queue and existing content access.

React Hook Form owns the reusable guest/manual-entry form; React Query handles submission and staff data. No guest contacts are persisted to browser storage. The receipt contains neither a booking reference nor an existing customer's details. A duplicate pending phone returns the same neutral received response, without creating a second request. Staff manual entry uses their authenticated database session, preserving the real audit actor. Staff names in the reservation history are resolved server-side after staff authorization and return display names only.

Verification: both SQL contracts passed against deployed schema with fixtures rolled back. Live HTTP checks covered concurrent same-key submission, changed-key payload conflict, equivalent phone duplication, source/status tampering, staff-only list/detail, manual Zalo confirmation, real audit attribution and stale status conflicts. An authenticated Realtime subscriber received a newly persisted request. Only explicitly identified temporary test reservations/receipts were removed; their redacted audit history is retained. The production build, lint, types, UI rules and all 25 test suites passed. Browser checks cover 390/768/1440px guest forms, review/error/receipt states, staff queue and manual-entry drawer.

Confirmation is channel-neutral: website requests start pending; staff can create already agreed phone/social bookings directly as confirmed, or confirm an existing pending request without logging a mandatory callback. Source records the booking channel, not a requirement to call.
