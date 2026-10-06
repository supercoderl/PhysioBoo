# Notes — Redesign

Route: `/admin/system/note/all` · Component: `AllNoteComponent` · Service: `NoteService`

Personal notes for the signed-in user. Notes are private: nobody else (including admins) sees or edits them.

## 1. UX Audit

The page was a static clone of a demo app: hard-coded cards, a "Take a note..." box that did nothing, a search box and two icon buttons with no behaviour, and no data source.

## 2. Current Problems

- No service, no API, no persistence; every card was hard-coded HTML.
- Search, sort and view buttons were decoration.
- No keyboard access (cards were not focusable), no loading/empty/error states.

## 3. Information Architecture

- **Note**: optional title, content, checklist (text + done), labels, optional reminder time, pinned, archived.
- **Label**: free text (max 30 chars, max 10 per note), case-insensitive, derived from notes (no label table).
- Two lists: active notes and archived notes.

## 4. User Journey

1. Open Notes → see pinned notes first, then most recently changed.
2. "Take a note..." → editor opens → type title/content, add checklist items and labels → Save.
3. Click a card to edit; tick checklist items straight on the card; pin / archive / delete from the card.
4. Filter by label chip, search by text, switch to Archived.

## 5. Layout

Header (title, Archived toggle, search) → composer bar → label chips → masonry grid (1 / 2 / 3 columns) → editor dialog.

## 6. Wireframe

```
Notes                                   [Archived] [Search notes   ]
[ + Take a note...                      ]
(Work · 3) (Personal · 2) (Tasks · 1)
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Title  📌│ │ Title  📌│ │ Title  📌│
│ content  │ │ ☑ item   │ │ content  │
│ [Work]   │ │ ☐ item   │ │ ⏰ time  │
└──────────┘ └──────────┘ └──────────┘
```

## 7. Component Hierarchy

`AllNoteComponent` (header, composer, label chips, grid, editor dialog) → `AdminContentHeaderComponent`, `BooIconComponent`, `EmptyStateComponent`. One component: the editor is state of the page (a draft), not reused elsewhere.

## 8. UI Specification

Cards: `#F6F7F8`, 1px `#E5E7EB` border, rounded-lg; pin button top right; actions (archive, delete) appear on hover/focus on desktop and are always visible on touch widths. Active label chip uses the primary colour.

## 9. Interaction Design

- Editor edits a **draft copy**; the list changes only after Save succeeds.
- Enter in the label / checklist inputs adds the entry; unsaved typed text is added on Save, not dropped.
- Esc closes the editor; the backdrop click closes it.
- Search is debounced (300 ms). Pin/archive reload the list; ticking an item updates the card in place.
- Delete asks for confirmation (shared dialog).

## 10. Responsive Behaviour

Grid collapses 3 → 2 → 1 columns. The editor is a bottom sheet on phones and a centred dialog from `sm`.

## 11. Accessibility

Cards are `role="button"`, focusable, open on Enter. Icon buttons have `aria-label`; pin/archive toggles use `aria-pressed`; label chips are a labelled group; the editor is `role="dialog" aria-modal`. Buttons are at least 32–40 px high.

## 12. Page States

Loading (skeleton cards, `aria-busy`), empty (three messages: no notes / nothing matches / no archived), saving (button disabled and "Saving..."), success (toast), error (global interceptor toast).

## 13. Edge Cases

A note with only a checklist is valid; a note with nothing is rejected. Over-long text and too many labels (10) or items (50) are rejected by the server. Duplicate labels are merged case-insensitively. Another user's note id behaves exactly like a missing one (404).

## 14. Performance

One query for the user's notes, capped at 500; search/label filtering runs on that small list in memory (labels and checklist are JSON text). `trackBy` on the grid. No virtual scroll: a personal list does not need it.

## 15. Scalability

If notes need sharing, full-text search or thousands per user, move labels to a join table and search to the database; the API shape does not change.

## 16. Enterprise Recommendations

Do not put patient data in notes: they are not part of the medical record and are not audited per patient. Reminders are stored but do not notify yet (a notification job could read `reminderAt`).

---

## 17. API Contract

All routes need a login only (no permission code). Responses use `ResponseMessage<T>`.

| # | Purpose | Method | URL | Request | Response | Frontend usage |
| - | ------- | ------ | --- | ------- | -------- | -------------- |
| 1 | List my notes | GET | `/api/notes?search&label&archived` | — | `Note[]` (pinned first, then newest) | page load, search, label chips, Archived toggle |
| 2 | List my labels | GET | `/api/notes/labels` | — | `{ label, count }[]` (active notes) | label chips |
| 3 | Create | POST | `/api/notes` | `SaveNotePayload` | `Note` | editor Save (new) |
| 4 | Replace | PUT | `/api/notes/{id}` | `SaveNotePayload` | `Note` | editor Save, pin, archive, tick item |
| 5 | Delete | DELETE | `/api/notes/{id}` | — | `id` | card / editor Delete |

`SaveNotePayload`: `{ title: string|null, content: string, labels: string[], checklist: {text, done}[], reminderAt: string|null, isPinned: boolean, isArchived: boolean }`.

## 18. Server behaviour (implemented)

- `Note` entity (table `Notes`), owner = signed-in user; labels/checklist stored as JSON text (`LabelsJson`, `ChecklistJson`).
- Update is a guarded `UPDATE … WHERE Id AND OwnerUserId`, so a note that is not yours cannot be changed or deleted.
- Delete is a soft delete.
- Errors: `NOTE_EMPTY_CONTENT`, `NOTE_TEXT_EXCEEDS_MAX_LENGTH`, `NOTE_TOO_MANY_LABELS`, `NOTE_TOO_MANY_ITEMS`.

## 19. Deliverables

- [x] This document
- [x] API contract (§17)
- [x] Types `shared/types/note.types.ts`, service `services/admin/note.service.ts`, `NOTE` in `base.ts` / `loading.ts`
- [x] Page rewritten (`note/all`)
- [x] Backend: entity, configuration, repository, 3 queries/commands, `NoteEndpoints`
