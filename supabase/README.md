# Fresh database setup

Apply the two files in `migrations` in order to a fresh Supabase project. App baseline creates the schema, access policies, functions and triggers. App initialization creates the storage buckets and default seating and video settings. Initialize the first admin through Supabase Auth and `staff_members`, then configure the app with its Supabase and R2 settings.

Events and articles keep draft and ready rows in their own tables. Drafts may be incomplete. Publishing validates the same row, preserves its ID and releases the editing session’s upload claims in the same transaction. Only ready content can appear publicly, subject to event visibility and article publication time.

`npm run verify:db-baseline` installs the two files into a disposable local PostgreSQL database, repeats initialization and runs the SQL contracts. Supply loopback PostgreSQL connection settings and client tools. `tests/fixtures/platform.sql` is local test scaffolding.

Use this baseline on a fresh schema. Existing project data and migration history need a separately coordinated reset or transfer.

For an existing project that has the previous draft-table schema through `20261110000300`, run `transitions/inline-content-drafts.sql` once in SQL Editor. It requires an empty draft table and updates the existing schema in place. Keep the existing migration history. Fresh installs use only the two files in `migrations`.
