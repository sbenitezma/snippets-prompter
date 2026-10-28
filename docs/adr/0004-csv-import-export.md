# ADR 0004 — Import and export prompts as CSV for spreadsheets

## Status
Accepted (2026-10-28).

## Context

Prompts live only in the browser's `localStorage`. Two needs follow from that:

- **Safety**: a way to keep a copy outside the browser (cleared site data, a new computer).
- **Bulk editing**: writing or reviewing many prompts is faster in a spreadsheet (Google Sheets, Excel) than one by one in a form, and a spreadsheet is a natural place to keep a curated library.

The primary scope has no server and no accounts (ADR 0003), so whatever is chosen must work entirely in the browser.

## Options considered

| Option | For | Against |
| --- | --- | --- |
| **CSV file** | Every spreadsheet opens and saves it (Google Sheets: *File → Import* / *File → Download → CSV*). Plain text, diff-friendly. A parser is ~60 lines of tested code, no dependency. | One sheet only, no formatting; delimiter and encoding vary by tool and locale. |
| XLSX file | Native to Excel; several sheets, formatting. | Needs a library: the best-known one is no longer published to npm (distributed from its own CDN), the main alternative adds hundreds of kB. Large dependency for one feature. |
| Google Sheets API | Live sync with a sheet. | OAuth client, consent screen and token handling: the app would stop being "no account, no server". Locks the feature to one vendor. |
| JSON file | Trivial with `JSON.stringify`. | Not editable in a spreadsheet, which is half of the need. |

## Decision

**CSV**, with these rules:

- **Columns**: `title, body, categories, id, sourceId`. The columns people edit come first. `categories` is comma-separated, exactly like the form field. `id` lets a re-import update prompts instead of duplicating them. `sourceId` keeps the "created from" link.
- **Tolerant import**: column order is free and names match loosely (`Source ID`, `source_id`). The delimiter is detected (`,` from Google Sheets, `;` from Excel in European locales, tabs from a copy-paste). A UTF-8 byte order mark is ignored, and blank lines are skipped.
- **Same validation as the form**: each row goes through the form's Zod schema, so an imported prompt follows the same rules as a typed one. Invalid rows are skipped and reported by their spreadsheet row number.
- **Preview, then confirm**: the import shows how many prompts are new, updated and unchanged, plus the skipped rows. Nothing changes until the user confirms. **An import never deletes**.
- **Export for Excel**: UTF-8 with a byte order mark, so Excel shows accents correctly. Line breaks inside a prompt are kept, quoted per RFC 4180.
- **CSV injection**: cells starting with `=`, `+`, `-` or `@` are exported with a leading apostrophe. Spreadsheets treat it as "plain text" instead of running the cell as a formula. Import removes the apostrophe again.

## Consequences

- No new runtime dependency; the parser and the mapping are pure functions with unit tests (`src/lib/csv.ts`, `src/lib/promptsCsv.ts`).
- Working with Google Sheets is a manual round trip (download CSV, import it; export, then *File → Import* in the sheet). If live sync is ever wanted, the Google Sheets API option becomes relevant again, together with the phase 2 backend.
- One sheet only. That is enough for the current data model, which has a single entity.
