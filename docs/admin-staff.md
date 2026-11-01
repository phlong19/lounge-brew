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

Set SUPABASE_SECRET_KEY (sb_secret_...) on the server only. The admin factory rejects missing or legacy-format keys without falling back. Local configuration is present in the ignored .env.local; .env.example includes only an empty placeholder. src/lib/supabase/admin.ts is marked server-only. Never use a NEXT_PUBLIC_ name for this key.

## Event filters and navigation

Hiển thị now includes Sắp tới and Đã qua, defaulting/resetting to Sắp tới. The exact event start timestamp is the boundary: starts in the future are upcoming, started events are past. Upcoming results are nearest first; past results are most recent first. These options coexist with all/visible/hidden and month/year filters. The seating navigation uses an armchair icon.

## Verification

Live temporary-account tests covered anonymous/editor denial, active-admin creation, new staff sign-in, duplicate email rejection without role escalation, creator auditing, name display, event filters and the seat icon. Staff creation and navigation were checked at 390/768/1440px. Temporary Auth users and staff rows were removed afterward.

## Forms and data fetching

Admin login, staff creation, event editing and shared seating settings use React Hook Form. Existing custom inputs (Radix Select, rich text, currency and uploads) connect through Controller or setValue. The APIs independently validate all persisted fields, including password strength.

TanStack React Query owns admin event/staff/seating reads and save/delete/session mutations. Reads pass cancellation signals to the existing fetch transport, cache for 30 seconds and refresh relevant queries after successful writes. Mutation responses update confirmed event/seating cache entries. Failed writes retain form values; writes are never automatically retried. Query clients are scoped to the admin layout and remounted for a different user or role; login/logout clear private caches. Supabase remains behind the existing authenticated Next.js API routes and server-side access checks. The video tab remains a local preview without database persistence.

## Staff actions — 1 November 2026

The directory, search and action endpoints require an active admin. Editors/booking staff have no staff navigation link; `/admin/staff` returns not found to those roles, and staff APIs return 403. Admin accounts are excluded from the directory and cannot be targeted by its actions. Self-management is also rejected.

The directory searches names and canonical Auth email addresses and filters by access status. Email is joined from `auth.users` by an admin-guarded, bounded SQL function; no second editable email copy is stored on `staff_members`. Row menus provide access lock/unlock and a password dialog using the same 8–22 character strength requirements as account creation. Delete is a disabled destructive placeholder; no DELETE endpoint exists.

Migration `20261101020000_staff_security.sql` adds `tokens_valid_after`, an admin directory function, a caller access check and a service-only session-ending action. Access locks first disable application permissions, then ban sign-in and finish by deleting that target staff member's Auth sessions and advancing the token cutoff. Unlock removes the Auth ban, restores the staff flag and ends any old sessions again. Password changes use the server secret Auth client, then end sessions and advance the cutoff. Tokens issued before the cutoff cannot regain application rights even after unlock. Fresh tokens issued in the following second are valid. This closes the normal stateless JWT expiry window at the application/RLS layer; it does not change the cryptographic expiry of JWTs.

All admin APIs validate the caller's cutoff through `staff_access_allowed`; database staff-role checks apply the same cutoff. Security actions record the verified admin actor in shared `audit_log`. Passwords, hashes and token values are never passed to the audit/session RPC. Auth and database operations span services: failures after an Auth change return an explicit partial-success error; a failed Auth ban after an app lock is reported as a warning while app access remains denied. No action can lock or reset an admin through this directory.

SQL contract fixtures are transactionally rolled back. Live verification used a temporary editor and checked non-admin denial, canonical email filtering, disable/unlock, immediate old-JWT denial, failed old refresh, password strength, old/new password behavior, audit attribution/redaction and DELETE=405. The temporary user was removed; configured accounts/passwords were unchanged.
