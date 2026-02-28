# BUGS.md

Known issues and their status.
Do NOT include: vague complaints ("it feels slow"), resolved bugs, or speculative issues.
DO include: specific reproducible problems with enough detail to fix them.

---

## Open

### [HIGH] v3 CSV export missing quote escaping
- **File:** `components/CloudExportDrawer.tsx` — `handleExport()` function
- **Branch:** `feature-data-export-v3`
- **Problem:** Inline CSV builder does not escape double-quote characters in descriptions. If a description contains `"`, the exported CSV will be malformed and fail to parse correctly in Excel/Sheets.
- **Fix:** Add `.replace(/"/g, '""')` to the description field, matching the pattern in `lib/utils.ts` `exportToCSV()`
- **Found by:** Automated code analysis (`code-analysis.md`)

### [LOW] v2 CSV column order inconsistency
- **File:** `components/ExportModal.tsx` — `doExportCSV()` function
- **Branch:** `feature-data-export-v2`
- **Problem:** Column order is `Date, Category, Amount, Description` but `lib/utils.ts` uses `Date, Amount, Category, Description`. Minor inconsistency but could confuse users switching between export methods.
- **Fix:** Align both to the same order — `Date, Amount, Category, Description` preferred.

---

## Resolved

*(none yet)*

---

## Won't Fix

*(none yet)*
