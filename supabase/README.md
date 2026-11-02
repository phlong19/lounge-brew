# Database setup and migration baseline

The active migration chain has two files:

1. `20261102010000_app_baseline.sql`: final application tables, indexes, constraints, functions, RLS, grants, audit triggers, storage policies and reservation Realtime publication membership.
2. `20261102010100_app_initialization.sql`: public/private media buckets and required seating/video singleton rows. Repeating initialization does not overwrite existing settings.

Removed columns and obsolete tables are absent from the final schema. These files contain no accounts, passwords, real reservations or imported event articles/media. Historical SQL remains under `history/pre-baseline-20261102`, with checksums in `manifest.json`; the CLI does not execute that directory.

## Fresh Supabase project

Use a new Supabase project with its managed `auth` and `storage` schemas, `anon`/`authenticated`/`service_role` roles and `supabase_realtime` publication. This is not a standalone replacement for Supabase Auth, Storage or Realtime.

Link the intended project using the Supabase CLI and run its migration push command. The CLI should report just the two baseline versions as pending. Never apply these files manually over an existing application schema. Afterward run the SQL contracts in `tests` inside rolled-back transactions.

Configure the app's publishable URL/key and server-only `SUPABASE_SECRET_KEY` for the new project. Create the initial Auth account through secure provisioning, then associate its UUID with an admin `staff_members` row. Do not seed passwords or copy Auth IDs from another project into the baseline. Other staff can be created in the admin UI.

Upload seating maps and configure their public media assets. Import event/article data separately if needed. Transferring existing accounts, customer records, content and bucket files is a separate data-migration task; SQL schema migrations do not copy uploaded files or Auth settings.

## Existing application database: one-time history transition

The existing project must recognize the baseline as already applied. Do not replay baseline DDL or initialization over it.

`node scripts/reconcile-migration-baseline.mjs` loads the ignored `.env.local` file and uses its project URL and Management API token. It defaults to a dry run: checks known legacy migration versions and runs all contract suites in rolled-back transactions.

Only after a successful dry run, `node scripts/reconcile-migration-baseline.mjs --apply`:

- Backs up migration-history records to ignored `.agent/baseline-history-backup.json`.
- Locks and rechecks migration history to prevent concurrent migration changes.
- Removes application roles' unnecessary TRUNCATE/TRIGGER/REFERENCES grants and anonymous write grants.
- Replaces only recognized legacy history entries with the two baseline records, storing the exact new SQL as migration metadata.
- Verifies application table row counts remain unchanged. It does not execute the stored baseline SQL or initialization, reassign staff, overwrite settings or copy/delete media files.

Stop concurrent schema deployments during this one-time cutover. Unknown history versions abort the script. This helper is specific to the baseline cutover; use normal new forward migrations afterward. For rollback planning, retain the history backup and archived SQL; restoring metadata alone does not revert schema/privilege changes. Keep a normal project backup as well.

The project `zcftrbvrfiypqtwhmxxj` completed this transition on 2 November 2026. Other environments must run their own dry run and transition before deploying this branch.

## Verification

`npm run verify:db-baseline` needs Node and PostgreSQL client tools (`psql`, `createdb`, `dropdb`, `pg_dump`) plus a disposable local PostgreSQL server. Set `PGHOST=127.0.0.1`, `PGPORT`, `PGUSER` and `PGPASSWORD`; optionally set `PG_BIN` to the client-tool directory. The account must create/drop test databases and create the three service test roles if missing.

The verifier rejects non-loopback hosts. It creates two uniquely named test databases, replays the archived history in one and the baseline in the other, compares schema-only dumps, repeats initialization, runs every SQL contract and drops only its generated databases. `tests/fixtures/platform.sql` supplies minimal managed-service stand-ins solely for local testing; NEVER run it against a hosted project.

Verified on isolated PostgreSQL 16: equivalent schema after grant hardening; seven contract suites passed; repeated initialization passed. All seven contracts also passed against the current hosted Supabase project using rolled-back fixtures. A fresh hosted project still requires its normal Auth/Storage configuration and deployment smoke test.

Add subsequent changes as new timestamped migrations. Existing applied versions are not rerun on each deployment. Consolidation improves clean installation and maintainability; it does not speed up application queries.
