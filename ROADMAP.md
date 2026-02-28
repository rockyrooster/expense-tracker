# ROADMAP.md

Planned features and improvements, roughly prioritised.
Do NOT include: vague wishes, everything at once, or things you've already built.
DO include: specific features with enough detail that Claude can start immediately, ranked by priority.

---

## High Priority (next sessions)

### Merge v3 into main and deploy to Vercel
- Merge `feature-data-export-v3` into `main`
- Fix CSV quote-escaping bug in `CloudExportDrawer.tsx` before merging
- Push to GitHub, connect to Vercel for live deployment

### Fix v3 CSV bug
- File: `components/CloudExportDrawer.tsx` in `handleExport()`
- Issue: inline CSV builder missing `replace(/"/g, '""')` escaping
- Fix: add escaping to description field, same pattern as `lib/utils.ts`

---

## Medium Priority

### Monthly budget limits
- Allow user to set a spending limit per category per month
- Show warning indicator when approaching or exceeding limit
- Store limits in localStorage alongside expenses

### Recurring expenses
- Mark an expense as recurring (weekly/monthly)
- Auto-generate future instances
- Distinguish recurring from one-off in the list view

---

## Low Priority / Nice to Have

### Better mobile experience
- Current layout works on mobile but wasn't optimised for it
- Filter bar wraps awkwardly on small screens
- Consider a bottom sheet for filters on mobile

### Keyboard shortcuts
- `N` to open Add Expense form
- `Escape` to close any modal
- Arrow keys to navigate expense list

### Notes field on expenses
- Optional long-form note per expense
- Not shown in list view, expandable on click

---

## Decided Against

### User authentication
- Adds significant complexity (backend, sessions, security)
- Not needed for a personal single-user app
- Revisit only if multi-user access becomes a requirement

### External database
- localStorage is sufficient for personal use
- Adding a DB requires a backend, deployment complexity, costs
