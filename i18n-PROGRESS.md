# ERP Frontend i18n Progress

Tracks rollout of `react-i18next` across `src/features/*`. Infrastructure
(`src/i18n/index.ts`, `src/i18n/locales/en/common.json`) is in place;
English only for now. Each module gets its own namespace
(`src/i18n/locales/en/<module>.json`) converted independently so this can
be picked up module-by-module across sessions.

| Module | Files | Status |
|---|---|---|
| library | 61 | ✅ done (template module; see note below) |
| accounts | 68 | ⬜ pending |
| admission | 136 | ⬜ pending |
| alumni | 121 | ⬜ pending |
| auth | 8 | ⬜ pending |
| canteen | 52 | ⬜ pending |
| dashboard | 8 | ⬜ pending |
| front-office | 138 | ⬜ pending |
| hostel | 127 | ⬜ pending |
| inventory | 103 | ⬜ pending |
| module-auth | 1 | ⬜ pending |
| module-home | 2 | ⬜ pending |
| sales-purchase | 122 | ⬜ pending |
| sports | 53 | ⬜ pending |
| staff | 16 | ⬜ pending |
| transport | 65 | ⬜ pending |

### library note

All 39 files under `pages/` and `components/` (per the original conversion
checklist) now use `useTranslation('library')` / `useTranslation('common')`.
`api/`, `types/`, `stores/`, `utils/` were left untouched (no UI strings).
`src/i18n/locales/en/library.json` holds 587 leaf keys across 11
page/component sections. One deliberate, minor omission: in
`CopyTable.tsx` the book-copy `condition`/`status` badge text is rendered
by capitalizing the raw enum value from data (not a literal string in
JSX), so it was left as-is rather than mapped through `t()` — the same
enum labels are already translated everywhere they appear as literal
`<option>`/select text (`copies.conditions.*`, `copies.statuses.*`).

## Conventions

- One namespace per `src/features/<module>` directory.
- `useTranslation('<module>')` in components; shared cross-module strings
  (Save/Cancel/Delete/Loading/etc.) go in the `common` namespace instead.
- Locale files live at `src/i18n/locales/en/<namespace>.json`, keyed by
  page/component so keys stay traceable to source (e.g.
  `members.createPage.title`).
- Register each new namespace's import in `src/i18n/index.ts`'s
  `resources.en` object as it's completed.
