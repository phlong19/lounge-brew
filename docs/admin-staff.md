# Staff management

Implemented 31 October 2026.

## Data and access

The deployed migration 20261031000000_staff_display_names.sql adds staff_members.display_name. Existing names are backfilled from Auth full_name/name metadata, otherwise the account email prefix. Existing roles and active flags are preserved. Names must contain 1–120 characters. Membership changes are audited using staff user IDs.

The account menu displays this stored name. Active admins see the Nhân viên navigation link and /admin/staff creation page. Editors cannot open that page or access its staff APIs. Every request checks current active membership from the database, rather than trusting browser state or user-editable Auth metadata.

## Creating staff

The form accepts name, email, an initial password of 8–22 characters with uppercase, lowercase, a digit and a special character, without whitespace, and an admin/editor role (editor by default). It creates a confirmed Supabase Auth account without sending an invitation email, then inserts active membership using the requesting admin's RLS permissions and audit identity. Credentials are never returned in the API response or stored in the staff table.

Only the Auth create/delete operations use the server-only service client. If membership creation fails, the newly created Auth account is removed. A cleanup failure leaves no authorized staff membership and is logged for server-side review. Existing accounts are never promoted or overwritten when an email is duplicated.

GET /api/admin/staff?page=1 returns a private, paginated list of non-admin staff names, roles and access states, 20 per page. Admins are excluded from both records and counts. POST returns the created staff membership with status 201; editors receive 403, anonymous callers 401, invalid fields 400, and duplicate emails 409. Mutations use the shared same-origin check.

## Configuration

Set SUPABASE_SERVICE_ROLE_KEY on the server only. Local configuration is present in the ignored .env.local; .env.example includes only an empty placeholder. src/lib/supabase/admin.ts is marked server-only. Never use a NEXT_PUBLIC_ name for this key.

## Event filters and navigation

Hiển thị now includes Sắp tới and Đã qua, defaulting/resetting to Sắp tới. The exact event start timestamp is the boundary: starts in the future are upcoming, started events are past. Upcoming results are nearest first; past results are most recent first. These options coexist with all/visible/hidden and month/year filters. The seating navigation uses an armchair icon.

## Verification

Live temporary-account tests covered anonymous/editor denial, active-admin creation, new staff sign-in, duplicate email rejection without role escalation, creator auditing, name display, event filters and the seat icon. Staff creation and navigation were checked at 390/768/1440px. Temporary Auth users and staff rows were removed afterward.

## Forms and data fetching

Admin login, staff creation, event editing and shared seating settings use React Hook Form. Existing custom inputs (Radix Select, rich text, currency and uploads) connect through Controller or setValue. The APIs independently validate all persisted fields, including password strength.

TanStack React Query owns admin event/staff/seating reads and save/delete/session mutations. Reads pass cancellation signals to the existing fetch transport, cache for 30 seconds and refresh relevant queries after successful writes. Mutation responses update confirmed event/seating cache entries. Failed writes retain form values; writes are never automatically retried. Query clients are scoped to the admin layout and remounted for a different user or role; login/logout clear private caches. Supabase remains behind the existing authenticated Next.js API routes and server-side access checks. The video tab remains a local preview without database persistence.
