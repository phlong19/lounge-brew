# Admin layout and feedback — 1 November 2026

The authenticated `app/admin/layout.tsx` renders one persistent `AdminShell` around route content. The sidebar, account menu, breadcrumb, reservation badge/subscription, query provider and toast provider remain mounted while navigating among events, video, seating, reservations and staff. All workspace navigation uses owned Next.js links. The three configuration sections retain their existing `/admin?section=...` URLs; staff and reservations retain dedicated routes. Only the page content is replaced by `admin/loading.tsx`.

Page Server Components and API handlers still enforce staff permissions. Moving the visible shell into the layout does not replace per-page/API authorization. Staff management remains admin-only. Auth sign-in/sign-out intentionally perform a full navigation to replace identity-scoped state; ordinary workspace links do not.

Success mutations use the shared Radix/shadcn-style toast provider: event save/delete, video/seating save, staff creation/access/password changes and reservation creation/status changes. Toasts do not steal focus and pause their timeout on hover/focus. User-facing errors and informational/warning feedback use owned shadcn-style Alert primitives. Field validation remains next to the affected input; a guest booking receipt remains a persistent receipt rather than a transient success toast. Partial staff-security warnings remain alerts, not success toasts.

Delete/remove controls use the destructive button/menu variants, including image removal and event confirmation. Clearing a staged image does not claim a successful database deletion; persistence still happens through Save. Video and seating Save labels are `Lưu`.

All authored styling uses Tailwind classes. Radix menu, dialog, popover and toast dependencies are aligned so opening a password dialog from its menu does not leave outside pointer interactions blocked after closing.

Browser verification retains a reference to the sidebar DOM element across all five sections and checks for its removal and full main-document navigations. Mocked API mutations verify success toasts, persistent alerts, destructive controls and modal recovery without changing live records. Responsive checks cover 390, 768 and 1440px. Existing unit tests, lint, types, UI rules and production build remain required.
