# Stock Take (Inventory Counting) — Redesign

Pages: `/admin/pharmacy/stock-take` (`AdminStockTakeComponent`) and `/admin/pharmacy/stock-take/:id/count` (`AdminStockTakeCountingComponent`).
Revision 2 — redesigns both pages as one workflow and aligns them with the backend that now exists (`PhysioBoo.Presentation/Endpoints/StockTakeEndpoints.cs`).

## 0. Summary

A stock take counts the active medicine batches of one warehouse (a hospital) against a snapshot of system quantities, then goes through approval. Approving a count **adjusts stock** (`batch.QuantityAvailable += difference`, plus a stock movement).

Lifecycle enforced by the backend:

```
Draft ──start──▶ Counting ──complete──▶ PendingApproval ──approve──▶ Approved (stock adjusted)
                                                   └─reject──▶ Rejected (final)
Cancelled: from any status except Approved / Cancelled.   Delete: Draft in the UI (API does not check status).
```

- `start` snapshots every active batch of the warehouse into `StockTakeItem.SystemQty`.
- `complete` is refused unless the session is `Counting` and **every** item is counted.
- `Rejected` has no transition back to `Counting`; the earlier "returned to Counting" wording was wrong and is removed.

## 1. UX Audit — previous state

List page: dark hero banner with decorative dots, duplicate "Print" button that only showed a toast, five filter controls in one row, a 640px-high fixed table, a side rail whose "Positive Sessions" repeated the discrepancy count.
Counting page: full-height shell with a floating summary panel covering the table, native `<select>`/`<input>` controls, autosave every 800 ms, a value difference computed as `difference * 4.2`.

## 2. Current Problems (found while inspecting code and API)

| # | Problem | Effect |
|---|---------|--------|
| 1 | Save sent `{ items: StockTakeItem[] }` (`id`, nullable `actualQty`); the API reads `{ itemId, actualQty:int }`. | Every save was silently ignored (`item == null → continue`). |
| 2 | `createdBy` / `assignedTo` read from the DTO; API returns `createdByName` / `assignedToName`. | Table columns were empty. |
| 3 | Counting summary invented a value (`difference * 4.2`). | Wrong money figure. |
| 4 | `onItemsChange` rebuilt the array without using its argument; autosave posted every 800 ms and wrote one activity row per call. | Activity trail flooded. |
| 5 | Complete dialog said uncounted items can be submitted "as-is". | API rejects it. |
| 6 | `GET /api/stock-takes/activities` was called without the required `limit`; `GET /api/users` does not exist. | 400 / 404. |
| 7 | Print/"sent to printer" toast: API only returns JSON. | False feedback. |
| 8 | Reject text promised "back to Counting". | Not supported. |
| 9 | Create/edit sent a null `scheduledDate`; `DateOnly` is required. | 400. |
| 10 | Action visibility ignored backend permissions (`pharmacy:stock-take:*`). | Buttons that 403. |

## 3. Information Architecture

- **Stock take list** — overview (KPIs) → find (search + filters) → sessions table → session details (drawer) → act.
- **Counting** — session identity & progress → categories → items grid → save / submit.
- The list opens counting through the row action; counting returns to the list.

## 4. User Journey

1. Create a draft (warehouse, department, date, optional counter) → *Start counting* (confirms the baseline snapshot).
2. Open the counting page, enter counts (keyboard or barcode), *Save counts* (Ctrl+S).
3. When nothing is left to count and nothing is unsaved → *Submit for approval*.
4. An approver reviews *differences*, then approves (stock adjusts) or rejects with a reason.

## 5. Layout

### List
```
Title + description                         [Refresh] [Export] [New stock take]
[Open] [Awaiting approval] [Approved this month] [With discrepancies] [Variance at cost]
┌ Search │ Reset ───────────────────────────────────────────────┐
│ Warehouse │ Department │ Status │ From │ To                     │
│ (filter chips)                                                  │
└─────────────────────────────────────────────────────────────────┘
Session ▸ code + "warehouse · department" │ Status │ Progress │ Scheduled │ Counter │ Variance │ [primary] ⋯
```
Row click on the code opens the **details drawer** (facts, progress, status-dependent actions, activity trail).

### Counting
```
[←] CODE  (status)  warehouse · department · date · counter        [Save counts] [Submit for approval]
Counted ▮▮▮▯ x / y │ To count │ Over system │ Short of system │ Variance at cost (saved)
notices: rejected reason · read-only reason · save failed
┌ Categories ┐ ┌ search │ scan barcode ─────────────────────────────┐
│ All items  │ │ [All n] [To count n] [Differences n]               │
│ Category   │ │ Medicine │ Batch/expiry │ System │ Counted │ Diff │ Reason │ Note
└────────────┘ │ footer: Showing a–b of N         pagination        │
```
Header is sticky from `lg` up; below that it scrolls with the page.

## 6. Component Hierarchy

```
AdminStockTakeComponent
├─ StockTakeKpiStripComponent          (boo-stat-card, boo-inline-error)
├─ StockTakeFilterBarComponent         (boo-input, boo-select, boo-datepicker, boo-filter-chips, boo-button)
├─ StockTakeTableCardComponent         (boo-table-admin, boo-status-badge, boo-button, boo-action-admin)
├─ StockTakeDetailDrawerComponent      (drawer, boo-status-badge, boo-empty/error-state)
├─ StockTakeDrawerComponent            (create / edit draft; drawer, boo-select, boo-datepicker, boo-input, boo-textarea)
├─ StockTakeAssignDialogComponent · StockTakeNoteDialogComponent · StockTakeDifferenceDialogComponent
└─ DialogService.confirm               (start, submit, delete)

AdminStockTakeCountingComponent
├─ StockTakeCountingHeaderComponent    (boo-status-badge, boo-button, button-icon)
├─ StockTakeCategoryTreeComponent
└─ StockTakeCountingTableComponent     (boo-input, boo-select)  + boo-pagination, boo-input (search / scan)
Shared: stock-take-actions.ts (status → allowed actions), stock-take-counting.model.ts (row/edit/validation), stock-take-counting.guard.ts
```
The entry grid is a native `<table>` because each row is an editor with unsaved/invalid state and Enter/arrow navigation; `boo-table-admin` is used for the read-only session list.

## 7. UI Specification

- Tokens as the inventory page: `bg-surface`, `border-borderGray/60`, `rounded-2`, `text-regular` / `text-secondary`, page width `max-w-[1600px]`.
- Status → badge tone: Draft/Cancelled neutral, Counting primary, PendingApproval warning, Approved success, Rejected danger.
- Row state in the grid: unsaved = amber tint + "Unsaved" label; invalid = rose tint + message; counted = green dot + "Counted". State is never colour-only.
- Difference: signed (`+3`, `-2`), green when over, red when short, `—` until counted. Value differences are shown as USD at purchase cost, labelled "at cost".

## 8. Interaction Design

- **Counting rules** (client-side, mirror the API): count is a whole number ≥ 0 (API `int`); every saved item stays counted (a count cannot be cleared); a reason is only offered when `counted − system ≠ 0` and is dropped when the difference returns to 0.
- **Save**: explicit (button or Ctrl/Cmd+S) — no autosave. Only edited rows are posted. Invalid rows block the save and are revealed. On failure the input is kept and a retry banner shows. On success the stored rows replace the list, edits typed during the request are kept, category progress/summary are re-read.
- **Duplicate prevention**: one lifecycle call at a time on the list (`acting`); `saving` / `submitting` on counting; buttons disable and show a spinner.
- **Unsaved changes**: `beforeunload` plus a `canDeactivate` guard (`unsavedChangesGuard`) with the shared confirm dialog.
- **Submit**: disabled with a stated reason while unsaved or uncounted items remain; fresh server summary shown in the confirm text.
- **Barcode**: Enter in the scan field jumps to the batch; several batches sharing a barcode are listed together.
- **Keyboard**: Enter / ↓ / ↑ move between count fields; Esc closes dialogs and drawers.

## 9. Responsive Behavior

Desktop first. KPI strip 5 → 3 → 2 columns; filter grid 5 → 2 → 1; the session table and grid scroll horizontally below ~960px; categories stack above the grid below `lg`.

## 10. Accessibility

Landmarks (`main`, labelled `section`/`nav`), `role="dialog"` + `aria-modal` + labelled title on every dialog/drawer, `aria-pressed` on the filter group, `aria-current` on the active category, `role="progressbar"` on progress, `role="status"`/`aria-live` for save state, scan result and notices, `role="alert"` for field errors, `<caption>` + `scope="col"` on the grid. Limitation: `boo-input` shows its label as a floating placeholder and does not associate it with the inner input.

## 11. Page States

List: loading (table skeleton), empty (no data / no match, with reset), error (retry, filters kept), KPI error (inline retry).
Counting: loading skeleton, invalid or unknown id → "not found", 403/other → error with retry, no items, no matches, read-only (not Counting, or no update permission), save failed, saving, saved.

## 12. Edge Cases

Route id that is not a GUID; API returns `null` for an unknown id; counting page opened for a non-`Counting` session (read-only); rejected sessions are final; a save while another save is running is ignored; stale list responses are dropped (`switchMap`); filter date range constrained (`from ≤ to`); expired batches flagged; items of a medicine without category appear under "All items" only.

## 13. Performance Considerations

Server pagination on the list; client pagination (25 rows) and `trackBy` on the grid; one `computed` pipeline for rows/filters/stats; lookups load once.

## 14. Scalability

`GET /items` returns the whole session (one row per active batch). Client paging keeps rendering cheap, but very large warehouses will want server paging (see §16).

## 15. Enterprise Recommendations

Persist the cancel reason and the counter id; server-side status checks on `POST /items`; a user lookup endpoint; real print/PDF; a units-based currency instead of fixed USD.

## 16. Backend API contract used (implemented — no endpoints invented)

| Purpose | Method + URL | Permission | Frontend use |
|---|---|---|---|
| Search sessions | `POST /api/stock-takes/search` `{pageNumber,pageSize,search,filter{warehouseId,departmentId,status,dateFrom,dateTo}}` | `pharmacy:stock-take:read` | list |
| KPIs | `GET /api/stock-takes/kpis` | read | KPI strip |
| Detail | `GET /api/stock-takes/{id}` (data may be `null`) | read | counting header |
| Create / update | `POST /api/stock-takes`, `PUT /api/stock-takes/{id}` `{warehouseId?,departmentId,scheduledDate,assignedTo,notes}` | create / update | drawer |
| Delete | `DELETE /api/stock-takes/{id}` (204) | delete | list |
| Start / complete / cancel | `POST /{id}/start`, `/complete`, `/cancel {reason}` | update | list, counting |
| Approve / reject | `POST /{id}/approve {note}`, `/reject {reason}` | approve / reject | list |
| Assign counter | `POST /{id}/assign {assignedTo}` (due date ignored by API) | update | dialog |
| Items | `GET /{id}/items` → rows; `POST /{id}/items {items:[{itemId,actualQty,reason,notes}]}` → all rows | read / update | counting |
| Categories, summary, history | `GET /{id}/categories`, `/summary`, `/history` | read | counting, drawer, dialogs |
| Export | `POST /api/stock-takes/export` | `pharmacy:stock-take:export` | list |
| Warehouses | `GET /api/warehouses` | read | filters, drawer |
| Counter candidates | `POST /api/users/search` | IAM user read | assign dialog, drawer |

Route guards (unchanged): list `pharmacy:medicine-inventory:read`, counting `pharmacy:medicine-inventory:create`. Actions are additionally gated by the matching `pharmacy:stock-take:*` permission (constants added to `permission.constant.ts`).

### Known backend limitations (not simulated in the UI)

1. `POST /items` does not check the session status, so the UI only allows entry while `Counting`.
2. Rejected is final; there is no way to reopen counting.
3. `StockTakeViewModel` has no `assignedTo` id, so the edit drawer cannot pre-select the counter (saving without one clears it — stated in the form). Creator/counter are e-mail addresses.
4. Cancel reason and assign due date are accepted but not stored.
5. Print returns JSON only, so the print action was removed.
6. `GET /items` is not paged; value differences use `UnitPurchasePrice` and carry no currency (USD is assumed, as on the inventory page).
7. No user-lookup endpoint; counter lists need the IAM user permission.
8. Delete and assign have no status rule server-side; the UI offers delete for Draft only.

## 17. Implementation Notes

Removed: hero header, activity rail, history drawer, complete dialog, floating summary panel, print/activities service methods. Changed files are listed in the change summary of the redesign task; `STOCK_TAKE.ACTIVITIES/PRINT` constants and loading keys were removed with their callers.
