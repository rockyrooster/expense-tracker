# DECISIONS.md

Records *why* key architectural and design decisions were made.
Do NOT include: obvious choices, temporary decisions, or anything that changes frequently.
DO include: non-obvious tradeoffs, rejected alternatives, and the reasoning behind lasting choices.

---

## Storage: localStorage over a database
**Decision:** Use browser localStorage for data persistence.
**Why:** No backend required, zero setup, works offline, sufficient for a personal expense tracker.
**Rejected:** Supabase, SQLite, Firebase — all add infrastructure complexity not justified for a solo demo app.
**Revisit if:** App needs multi-device sync or sharing between users.

## Styling: Tailwind CSS only
**Decision:** All styling via Tailwind utility classes. No CSS modules, no plain CSS, no inline styles.
**Why:** Consistent, co-located with markup, dark mode via `dark:` variants is clean, no context switching.
**Rejected:** CSS modules (separate files, more boilerplate), styled-components (runtime overhead).

## Dark mode: Class-based via `<html>` element
**Decision:** Toggle `dark` class on `document.documentElement`, persist preference in localStorage.
**Why:** Works with Tailwind's `dark:` variant system, preference survives page refresh.
**Rejected:** `prefers-color-scheme` media query only — user can't override system setting.

## Native `<select>` replaced with CustomSelect component
**Decision:** Built a custom dropdown (`components/CustomSelect.tsx`) instead of styling native `<select>`.
**Why:** Native `<select>` cannot be fully styled — system UI bleeds through, especially in dark mode.
**Tradeoff:** More code to maintain, but consistent cross-platform appearance.

## Charts: Recharts over Chart.js
**Decision:** Used Recharts for the spending pie chart.
**Why:** React-native API, no imperative canvas manipulation, easier to integrate with React state.
**Note:** Requires `dynamic` import with `ssr: false` due to browser-only APIs.

## Export: Three parallel implementations on separate branches
**Decision:** Built v1 (simple), v2 (modal), v3 (drawer) on separate git branches rather than iterating on one.
**Why:** Course exercise to demonstrate git branching — but also genuinely useful for comparing approaches.
**Preferred:** v3 (CloudExportDrawer) — side drawer pattern, templates, export history.
**Known issue:** v3 CSV builder missing quote-escaping present in v1/v2 — fix before shipping.
