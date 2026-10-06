# Scrumboard — Redesign

Routes: `/admin/system/scrumboard/list` (boards) and `/admin/system/scrumboard/board/:id` (one board)
Components: `ListScrumboardComponent`, `BoardScrumboardComponent` · Service: `ScrumboardService`

Shared team boards: a board has columns (lists) and each column has cards. Everyone in the tenant can see and edit every board; only the person who created a board can delete it.

## 1. UX Audit
The page was a static clone of a demo app: hard-coded board tiles with stock avatars, links to a board page that did not exist, and no data source.

## 2. Current Problems
- No service, no API, no persistence; the board page behind every tile was missing.
- Avatars, "Edited: almost 4 years ago" and descriptions were hard-coded.
- No loading, empty or error states.

## 3. Information Architecture
Board → Lists (ordered left to right) → Cards (ordered top to bottom). Card: title, description, optional due date. Boards carry no members: access is the whole tenant.

## 4. User Journey
1. Boards page → "New board" (title, description) → open it.
2. Add lists ("To do", "Doing", "Done"…), add cards at the bottom of a list.
3. Drag a card within a list or to another list; click a card to edit title, description, due date or delete it.
4. Rename a list by clicking its title; delete an empty list; rename or delete the board.

## 5. Layout
Boards page: breadcrumb, title, responsive tile grid (1/2/4 columns) with a dashed "New board" tile last. Board page: header (title, description, edit, delete) above a horizontally scrolling row of 288 px columns and an "Add a list" column.

## 6. Wireframe
```
Boards:   [Board tile] [Board tile] [Board tile] [ + New board ]
Board:    Title ✎                                  [Delete board]
          ┌ To do 2 🗑 ┐ ┌ Doing 1 🗑 ┐ ┌ Done 0 🗑 ┐ ┌ Add a list ┐
          │ [card]     │ │ [card]     │ │           │ └────────────┘
          │ [card]     │ │ + Add card │ │ + Add card│
          │ + Add card │ └────────────┘ └───────────┘
          └────────────┘
```

## 7. Component Hierarchy
`ListScrumboardComponent` (tiles + create dialog) · `BoardScrumboardComponent` (header, columns, card dialog, add list). Both use `AdminBreadcrumbComponent`, `BooIconComponent`, `EmptyStateComponent`; drag and drop uses the CDK `DragDropModule` already in `SharedModule`.

## 8. UI Specification
Columns `#F6F7F8`, cards white with a 1px `#E5E7EB` border; overdue due dates in red; the primary colour for actions.

## 9. Interaction Design
- Drag a card anywhere on the board; the card moves on screen immediately and the server renumbers both columns. If the server refuses, the board reloads.
- Enter adds a card / list; Esc cancels inline inputs or closes the dialog.
- A list with cards cannot be deleted (the button is disabled with a hint): cards are never lost silently.
- Deleting a board, list or card asks for confirmation.

## 10. Responsive Behaviour
Tile grid collapses 4 → 2 → 1 columns. The board scrolls horizontally on small screens. The card editor is a bottom sheet on phones.

## 11. Accessibility
Cards are focusable `role="button"` and open on Enter; icon buttons have `aria-label`; the dialogs are `role="dialog" aria-modal`; loading uses `aria-busy`. Drag and drop is mouse/touch only, and moving a card between lists by keyboard is not provided yet.

## 12. Page States
Loading skeletons, empty ("No boards yet"), board not found, saving (disabled button), success toasts; API errors are toasted by the global interceptor.

## 13. Edge Cases
- Two people moving cards at once: the last write wins and both columns stay consistently numbered (one transaction).
- A card cannot be moved to a list of another board (`SCRUMBOARD_WRONG_BOARD`).
- Someone else deleted the board while it is open: the next request returns 404.
- Two people adding a list/card at once may get the same position; the order is stable and the next move renumbers.

## 14. Performance
Boards page: three queries for any number of boards (boards plus two grouped counts). Board page: three queries (board, lists, cards). No pagination: a board is expected to hold tens of cards, not thousands.

## 15. Scalability
If boards grow large, load cards per list on demand and use a fractional index to avoid renumbering. Per-board members/permissions would add a membership table and a check in each handler.

## 16. Enterprise Recommendations
Do not store patient identifiers in cards: boards are visible to the whole tenant and are not audited per patient. Deleting a board is a soft delete, so it can be restored from the database.

---

## 17. API Contract
All routes need a login only. Responses use `ResponseMessage<T>`.

| # | Purpose | Method | URL | Request | Response | Frontend usage |
| - | ------- | ------ | --- | ------- | -------- | -------------- |
| 1 | List boards | GET | `/api/scrumboard/boards` | — | `ScrumBoardSummary[]` | boards page |
| 2 | Create board | POST | `/api/scrumboard/boards` | `{ title, description? }` | `ScrumBoardSummary` | New board dialog |
| 3 | Get board | GET | `/api/scrumboard/boards/{id}` | — | `ScrumBoard` (lists with cards, `canDelete`) | board page |
| 4 | Update board | PUT | `/api/scrumboard/boards/{id}` | `{ title, description? }` | `id` | header edit |
| 5 | Delete board | DELETE | `/api/scrumboard/boards/{id}` | — | `id` (creator only) | Delete board |
| 6 | Add list | POST | `/api/scrumboard/boards/{boardId}/lists` | `{ title }` | `ScrumList` | Add a list |
| 7 | Rename list | PUT | `/api/scrumboard/lists/{id}` | `{ title }` | `id` | click list title |
| 8 | Delete list | DELETE | `/api/scrumboard/lists/{id}` | — | `id` (must be empty) | list trash button |
| 9 | Add card | POST | `/api/scrumboard/lists/{listId}/cards` | `{ title, description?, dueDate? }` | `ScrumCard` | Add a card |
| 10 | Update card | PUT | `/api/scrumboard/cards/{id}` | `{ title, description?, dueDate? }` | `ScrumCard` | card dialog |
| 11 | Delete card | DELETE | `/api/scrumboard/cards/{id}` | — | `id` | card dialog |
| 12 | Move card | POST | `/api/scrumboard/cards/{id}/move` | `{ targetListId, targetIndex }` | `id` | drag and drop |

## 18. Server behaviour (implemented)
- Tables `ScrumBoards`, `ScrumLists`, `ScrumCards` (cards also keep `BoardId`). Positions are 0-based integers.
- New lists/cards go to the end. A move runs in one transaction: it removes the card from its column, inserts it at `targetIndex` (clamped) in the target column and renumbers both columns.
- Deleting a list that still has cards returns `SCRUMBOARD_LIST_NOT_EMPTY`; deleting someone else's board returns `SCRUMBOARD_NOT_BOARD_CREATOR`.
- Deletes are soft deletes. Not implemented: reordering lists, card labels/assignees/comments, board members.

## 19. Deliverables
- [x] This document and the API contract (§17)
- [x] Types `scrumboard.types.ts`, service `scrumboard.service.ts`, `SCRUMBOARD` in `base.ts` / `loading.ts`, route `board/:id`
- [x] Boards page rewritten, board page added
- [x] Backend: 3 entities, 3 configurations, 3 repositories, 2 queries, 10 commands, `ScrumboardEndpoints`
