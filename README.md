# Trixie Café & Lounge

A bilingual Trixie website built with Next.js 16, React 19, TypeScript, Tailwind 4, next-intl, Supabase, and react-pageflip. The public redesign preserves Trixie's logo, venue imagery, and latest 18 original menu pages.

Use Node 22.18 or newer. Install dependencies with `pnpm install`, then run `pnpm dev`. For production, run `pnpm build` followed by `pnpm start`.

## Project conventions

Read [AGENTS.md](AGENTS.md) before editing UI. All authored styling uses Tailwind classes. Pages and feature components compose primitives from `src/components/ui`; native elements belong inside that layer. The repository owns its `Typography` component and shared class maps. `globals.css` contains only the Tailwind import.

The approved design is in [the design specification](docs/superpowers/specs/2026-10-26-trixie-redesign-design.md). See [the implementation report](docs/reports/2026-10-26-trixie-implementation.md) for scope and verification.

## Content and configuration

Public pages work without database credentials using a verified local Trixie content snapshot. Upcoming shows are filtered using their actual dates; successful empty database results remain empty. The menu always uses the preserved original artwork, independently of database menu rows. Asset origins and dimensions are recorded in `src/data/trixie-assets.json`.

Supabase integration uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Apply `supabase/migrations/0001_initial_schema.sql` when configuring a database. Keep credentials in `.env.local`. The existing admin area is a read-only scaffold; authentication, staff permissions, editing, and publishing need a separate backend implementation.

The interface language is stored in the `LB_LOCALE` cookie. Both Vietnamese and English share the same original bilingual menu artwork. Reservations use the verified venue hotline; no booking form or seat-availability service is simulated.

## Verification

Run `npm run verify` for ESLint, TypeScript, UI source-rule checks, the Node test suites, and a production build. The first font-enabled build requires access to Google Fonts. Browser verification covers production output at mobile, tablet, and desktop sizes, both languages, menu navigation, zoom, focus restoration, reduced motion, and failure fallbacks.

## Main locations

- `src/app`: public routes, locale API, and admin scaffold.
- `src/components/ui`: reusable primitives and adapted shadcn/Radix components.
- `src/components/lounge`: menu viewer, show cards, gallery, and visit sections.
- `src/data`: verified content and asset provenance.
- `src/lib/server`: filtered database content with per-dataset snapshot fallback.
- `scripts`: source-rule enforcement and regression tests.
