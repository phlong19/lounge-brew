# Date display

All generated full dates use dd/MM/yyyy in Vietnamese and English, through src/lib/dates.ts. Calendar month headings and preserved original titles, editorial content and artwork retain their original text. Machine-readable dateTime attributes, API fields, database values and local datetime conversion remain ISO; timestamps use Asia/Ho_Chi_Minh for display.

DateInput provides a masked day-first text field and keyboard-accessible calendar. DateTimeInput composes it with a time field for admin events. Validation rejects impossible dates before producing an ISO calendar value. Reservation review formats the saved ISO date using the same shared helper. Cards, related events, archives, article publication dates, admin tables and calendar date labels use the helper as well.

The reservation form uses smaller gaps and padding, paired email/guest and date/time fields, and a shorter notes field. The public header has a soft bottom shadow. All authored styling remains Tailwind classes.

Popover was aligned to Radix 1.3.1, matching Dialog's focus-scope dependency. Older duplicate focus-scope versions prevented calendar focus inside modal forms.

Verified: lint, TypeScript, UI source rules, all 22 test suites and production build. VI/EN browser tests used a US browser locale and Los Angeles timezone at 390/768/1440px, checked the header shadow, day-first entry, invalid-day rejection, keyboard selection and review display. Dialog heights were 632–654px on desktop and 715–738px on mobile. Admin tests verified day-first editing preserves the ISO timestamp and Hanoi timezone; temporary accounts were removed.
