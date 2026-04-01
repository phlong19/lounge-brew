# Lounge Brew 2.0

Premium bilingual lounge menu built with Next.js App Router, `next-intl`, Supabase, `react-pageflip`, Tailwind CSS, and Framer Motion.

## Included foundation

- App Router + strict TypeScript scaffold
- Cookie-backed server i18n with `next-intl`
- Server-side i18n structure for zero-flicker rendering
- Supabase schema migration for categories, menu items, events, and articles
- Smart locale fallback helpers for `_en` to `_vi`
- Dedicated `/menu` route with `react-pageflip` and responsive portrait fallback
- Dedicated events and journal routes with shared cookie locale state
- Admin dashboard scaffold with side-by-side bilingual fields

## Quick start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Start development:

   ```bash
   pnpm dev
   ```

4. Apply the Supabase schema in `supabase/migrations/0001_initial_schema.sql`.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

If Supabase is not configured yet, the app falls back to local mock data so the UI still renders.

## Project structure

- `src/app` flat routes without locale segments
- `src/components/lounge` flipbook and event UI
- `src/components/admin` bilingual admin form primitives
- `src/i18n` cookie locale config and request config
- `src/lib/menu` locale mapping and page chunking helpers
- `src/lib/server` server-side data fetchers with mock fallback
- `supabase/migrations` database schema

## Next steps

- Wire Supabase Auth into `/admin`
- Add CRUD mutations and drag-and-drop ordering
- Replace mock data with seeded Supabase content
- Polish page textures, sounds, and book physics details
