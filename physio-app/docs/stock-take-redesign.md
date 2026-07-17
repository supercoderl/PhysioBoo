# Stock Take (Inventory Counting) — Redesign

## 0. Summary

Replace the current `stock-take` page (a single-file, inline-template demo with `alert()`/`confirm()`
calls, no service layer, and hard-coded rows — see §1) with a full **Stock Take** module: a session
list/dashboard for pharmacy & warehouse staff to plan, assign, and reconcile physical inventory
counts, plus a dedicated **Counting Workspace** for performing the count itself.

Visual identity for this pass: **Floating Panels + Split Layout, Graphite/Amber palette** — a
charcoal gradient hero header with floating stat chips, a sticky filter bar, a two-column split
(main table 75% + sticky Activity/Difference rail 25%) instead of Inventory Management's 3-column
KPI-strip dashboard or Retail's catalog-and-cart layout. The Counting Workspace itself is a
dedicated split workspace (category tree left, editable grid right, floating summary panel).

## 1. UX Audit — Current State

**File:** `src/app/pages/admin/pharmacy/stock-take/stock-take.component.ts`

- Single standalone component, fully inline template/logic, one hard-coded `StockTakeSession` and
  8 `StockItem` rows — no service layer, no pagination, no drawer, no routing to a counting screen.
- Filters are plain `<select>`/`<input>` with client-side `Array.filter`, no debounce.
- A native `<table>` (not `boo-table-admin`) with `[(ngModel)]` on Actual Qty and manual variance
  math in the template.
- Every action (`saveCount`, `verifyCount`, `startNewStockTake`, `pauseStockTake`,
  `completeStockTake`, `scanBarcode`, `exportToExcel`) is an `alert()`/`confirm()` stub —
  nothing persists, nothing matches `DialogService`/`ToastService` conventions used elsewhere.
- `StockItem`/`StockTakeSession` (`shared/types/stock.types.ts`) model a single flat count session
  with no warehouse/department scoping, no assignment, no approval workflow, no batch/reason
  tracking — cannot represent a real enterprise stock take (many sessions, many warehouses, an
  approval chain, per-item audit reasons).
- No relationship to the counting workspace required by the spec (category tree + editable grid);
  counting happens inline in the same table as the session list.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | One flat session, no session list/history | Can't plan multiple concurrent counts across warehouses/departments |
| 2 | No approval workflow | Differences go live with no review — no Approve/Reject/Pending Approval states |
| 3 | No assignment | No "Assigned To" — can't hand a count off to a specific counter |
| 4 | Counting mixed into the list table | No dedicated workspace for barcode-driven, category-scoped counting |
| 5 | `alert()`/`confirm()` | Inconsistent with `DialogService`/`ToastService` used everywhere else |
| 6 | No service layer | Nothing to swap a real backend into; no loading/error/empty states |
| 7 | No difference/variance summary | Pharmacist can't see completion %, value impact, or discrepancy count at a glance |

## 3. Information Architecture

```
Stock Take
├── List / Dashboard  (route: admin/pharmacy/stock-take)
│   ├── Hero Header            — title, quick stats chips, Create / Export / Print
│   ├── Filter Bar              — Warehouse, Department, Date Range, Status, Search
│   ├── Stock Take Table         — boo-table-admin, per-row action menu
│   └── Activity Rail (sticky)  — Recent Activities timeline + Difference Summary card
├── Drawers
│   ├── Create / Edit Draft Drawer
│   └── History Drawer          — session audit timeline
├── Dialogs
│   ├── Assign Counter Dialog
│   ├── Note Dialog             — reused for Approve (optional note) / Reject (required reason) / Cancel (required reason)
│   ├── Complete Counting Dialog — pending-item warning + confirm
│   └── Difference Detail Dialog — per-item variance breakdown
└── Counting Workspace  (route: admin/pharmacy/stock-take/:id/count)
    ├── Sticky Top Bar          — session info, progress stepper, autosave indicator, Complete button
    ├── Left — Category Tree    — Medicines / Consumables / Medical Supplies / Equipment, search
    ├── Right — Counting Grid   — barcode scan bar + editable table (Actual Qty, Difference, Reason, Notes)
    └── Floating Summary Panel  — Total / Counted / Remaining / +Diff / -Diff / Value Diff / Completion %
```

## 4. User Journey

1. Pharmacy staff opens **Stock Take** → hero header shows quick stats (Active, Pending Approval,
   Completed This Month, Total Variance Value); table lists all sessions.
2. Filters by Warehouse/Department/Status/Date Range or searches by Stock Take No; clicks
   **Create Stock Take** → drawer collects Warehouse, Department, Scheduled Date, Assigned To, Notes
   → saves as **Draft**.
3. From the table row menu: **Start Counting** (Draft → Counting, navigates to the Counting
   Workspace) or **Continue Counting** (resumes an in-progress session) or **Edit Draft**.
4. In the Counting Workspace, staff browses/searches the category tree, scans a barcode or types
   Actual Qty per row; rows with a non-zero difference are highlighted and require a Reason; the
   floating Summary Panel updates live; an autosave indicator confirms persistence.
5. Clicks **Complete Counting** → dialog warns about any remaining uncounted items → confirms →
   session moves to **Pending Approval**.
6. A supervisor opens the session, reviews the **Difference Detail** dialog (all variances, positive
   and negative, with reasons), then **Approves** (optional note) or **Rejects** (required reason,
   session returns to **Counting**).
7. Staff can **Cancel** a Draft/Counting session (required reason), **View History** (audit
   timeline drawer), **Print** (print preview) or **Export Excel** at any stage from the table menu.

## 5. Layout

Desktop (≥1280px), List/Dashboard page:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ HERO HEADER (gradient charcoal) — title · quick-stat chips · Create/Export/Print  │
├───────────────────────────────────────────────────────────┬──────────────────────┤
│ FILTER BAR — Warehouse · Department · Date Range · Status  │                      │
│ · Search                                                    │                      │
├───────────────────────────────────────────────────────────┤ ACTIVITY RAIL (25%,  │
│ STOCK TAKE TABLE (75%) — boo-table-admin, sticky footer/   │ sticky)              │
│ pagination, per-row action menu                             │ · Recent Activities  │
│                                                               │ · Difference Summary │
└───────────────────────────────────────────────────────────┴──────────────────────┘
```

Counting Workspace (≥1280px):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ STICKY TOP BAR — session code · warehouse/dept · progress stepper · autosave ·    │
│ Complete Counting                                                                  │
├───────────────────┬────────────────────────────────────────────────────────────┤
│ CATEGORY TREE      │ COUNTING GRID — barcode bar + editable table                │
│ (280px)            │ (Item Code, Name, Batch, Expiry, System Qty, Actual Qty,    │
│ search + tree      │  Difference, Reason, Notes)                                 │
└───────────────────┴────────────────────────────────────────────────────────────┘
Floating Summary Panel, bottom-right, collapsible.
```

Tablet (768–1279px): List page filter bar wraps to 2 rows, Activity Rail drops below the table as a
full-width row. Counting Workspace: category tree collapses into a slide-over triggered by a
"Categories" chip above the grid.

Mobile (<768px): List page becomes stacked cards (one per session) with the same actions in a
kebab menu; Counting Workspace grid becomes one editable card per item, category tree becomes a
bottom-sheet filter.

## 6. Component Hierarchy

```
AdminStockTakeComponent (list page)
├── StockTakeHeroHeaderComponent
├── StockTakeFilterBarComponent
├── StockTakeTableCardComponent
├── StockTakeActivityRailComponent
├── StockTakeDrawerComponent (create/edit)
├── StockTakeHistoryDrawerComponent
├── StockTakeAssignDialogComponent
├── StockTakeNoteDialogComponent (approve/reject/cancel)
├── StockTakeCompleteDialogComponent
└── StockTakeDifferenceDialogComponent

AdminStockTakeCountingComponent (counting workspace)
├── StockTakeCategoryTreeComponent
├── StockTakeCountingTableComponent
└── StockTakeSummaryPanelComponent
```

## 7. UI Specification

- **Hero Header**: full-width gradient (graphite → charcoal), white text, 4 floating stat chips
  (glass, `backdrop-blur`) overlapping the header's bottom edge by half their height, title +
  subtitle, primary Create button (amber accent) + secondary Export/Print icon buttons.
- **Filter Bar**: `boo-select` (Warehouse, Department, Status), `boo-datepicker` range (Scheduled
  Date From/To), `boo-input` search, Reset link.
- **Table**: `boo-table-admin` with columns per spec (§ Table Columns below); Status →
  `boo-status-badge`; Completed % → thin progress bar; Difference Value → colored (rose if
  negative-dominant, emerald if positive, gray if zero); Actions → `boo-action-admin` dropdown,
  items conditional on status (Continue Counting only if Counting, Approve/Reject only if Pending
  Approval, etc.).
- **Activity Rail**: compact vertical timeline (icon + actor + relative time), Difference Summary
  mini-card (positive/negative/value chips).
- **Counting Grid**: sticky header row, barcode input pinned above the table (Enter to jump to /
  focus the matching row), Actual Qty is an inline number input, Difference auto-computed and
  color-coded, Reason `boo-select` (enabled only when difference ≠ 0, required to save), Notes
  `boo-input`. Sticky "Save Progress" button + autosave indicator (`Saved 12s ago` / `Saving…`)
  top-right of the grid.
- **Category Tree**: expandable nodes with item counts, search box, active node highlighted.

## 8. Interaction Design

- Debounced (300ms) search in both the filter bar and category tree.
- Editing Actual Qty recomputes Difference and the floating Summary Panel immediately (client-side),
  then autosaves (debounced) via `updateItems`.
- Row-level and bulk actions confirm through `DialogService`/the Note Dialog — never native
  `alert()`/`confirm()`.
- Keyboard: `Enter` in the barcode field jumps to the matched row and focuses its Actual Qty input;
  `Tab` moves through Actual Qty → Reason → Notes per row.

## 9. Responsive Behavior

Covered in §5 per breakpoint (desktop split layout → tablet stacked rail/slide-over tree → mobile
cards/bottom-sheet).

## 10. Accessibility

- All icon-only buttons carry `aria-label`; status badges convey status via text, not color alone.
- Difference cells use both color and a `+`/`−` sign, never color alone.
- Drawers/dialogs trap focus and close on `Esc` (existing `DrawerComponent`/`DialogService` behavior).
- Interactive targets ≥40×40px; table rows fully keyboard-navigable via existing `boo-table-admin`.

## 11. Page States

- **Loading**: table shimmer (built into `boo-table-admin`), skeleton stat chips on first load.
- **Empty**: `boo-empty-state` for no sessions matching filters, and for a category with no items in
  the Counting Workspace.
- **Success**: toast on create/assign/approve/reject/complete/cancel.
- **Error**: `HttpService.getOr/postOr` mock-fallback pattern keeps the UI usable even before the
  backend exists; real errors still toast via the global interceptor.
- **Disabled**: Actual Qty/Reason/Notes disabled once a session is Approved/Rejected/Cancelled;
  Complete Counting disabled until at least one item is counted.

## 12. Edge Cases

- Session with zero items assigned (empty warehouse/department combination).
- Actual Qty entered as 0 for an item that legitimately has 0 system stock (difference stays 0, not
  flagged).
- Barcode scan matching an item outside the currently selected category (auto-switches category).
- Completing with items still `pending` — warned, not blocked (matches spec's "Complete Counting"
  requirement, mirrors `completeStockTake()`'s prior UX intent).
- Rejected session must show the rejection reason prominently when reopened for re-counting.

## 13. Performance Considerations

- Table and category tree both paginated/virtualizable via the existing `boo-table-admin` (already
  supports large datasets); counting grid uses `trackBy` on item id.
- Actual Qty edits are debounced before hitting `updateItems`, not fired per keystroke.

## 14. Scalability

- `StockTakeItem` carries `reason` as a free-form code today; recommended follow-up is a shared
  `AdjustmentReason` lookup (see §16) shared with Inventory Management's `adjustQuantity` reason
  field, so variance reasons are reported consistently across modules.

## 15. Enterprise Recommendations (follow-up, not built in this pass)

- Multi-user concurrent counting (two counters on the same session, per-item lock) — out of scope
  until the backend supports item-level locking.
- Barcode scanner hardware integration (current input is a text field awaiting Enter, same
  convention as Retail's barcode field) — real scanner wiring is a backend/device concern.
- Unify variance "Reason" with Inventory Management's batch adjustment reasons into one shared
  lookup once both backends exist.

## 16. Components

Reused as-is: `BooTableAdminComponent`, `BooActionAdminComponent`, `StatusBadgeComponent`,
`EmptyStateComponent`, `DrawerComponent`, `DialogService`/`DialogComponent`, `ToastService`,
`BooIconComponent`, `BooSelectComponent`, `BooDatepickerComponent`, `BooInputComponent`,
`PrintPreviewComponent`, `StatCardComponent`.

New, created only because no existing component covers the need: `StockTakeHeroHeaderComponent`,
`StockTakeFilterBarComponent`, `StockTakeTableCardComponent`, `StockTakeActivityRailComponent`,
`StockTakeDrawerComponent`, `StockTakeHistoryDrawerComponent`, `StockTakeAssignDialogComponent`,
`StockTakeNoteDialogComponent`, `StockTakeCompleteDialogComponent`,
`StockTakeDifferenceDialogComponent`, `StockTakeCategoryTreeComponent`,
`StockTakeCountingTableComponent`, `StockTakeSummaryPanelComponent`.

---

## 17. Backend API Contract (proposed — not implemented)

All endpoints are namespaced under `/api/stock-takes` and added to `BASE_API.STOCK_TAKE` in
`src/app/shared/api/base.ts`. None of these exist yet; the frontend service falls back to bundled
mock data until they do (same `getOr`/`postOr` pattern as `InventoryManagementService`).

### 17.1 `POST /api/stock-takes/search`
- **Purpose**: List/Dashboard table.
- **Request**: `PagedRequest<StockTakeFilter>` (`warehouseId?`, `departmentId?`, `status?`,
  `dateFrom?`, `dateTo?`, plus `search`/`page`/`pageSize`).
- **Response**: `PagedResponse<PaginationData<StockTake>>`.
- **Frontend usage**: `StockTakeService.search(request)` in `AdminStockTakeComponent`.

### 17.2 `GET /api/stock-takes/{id}`
- **Purpose**: Load a session for the Edit Drawer / Counting Workspace header.
- **Response**: `PagedResponse<StockTake | null>`.
- **Frontend usage**: `getById(id)`.

### 17.3 `POST /api/stock-takes`
- **Purpose**: Create Stock Take (Draft).
- **Request**: `{ warehouseId, departmentId, scheduledDate, assignedTo?, notes? }`.
- **Response**: `PagedResponse<string>` (new id).
- **Frontend usage**: `create(payload)` from `StockTakeDrawerComponent`.

### 17.4 `PUT /api/stock-takes/{id}`
- **Purpose**: Edit Draft.
- **Request**: same shape as create.
- **Response**: `PagedResponse<string>`.
- **Frontend usage**: `update(id, payload)`.

### 17.5 `DELETE /api/stock-takes/{id}`
- **Purpose**: Delete a Draft session.
- **Response**: `PagedResponse<string>`.
- **Frontend usage**: `delete(id)` from the table row menu.

### 17.6 `POST /api/stock-takes/{id}/start`
- **Purpose**: Draft → Counting; navigates to the Counting Workspace.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `start(id)`.

### 17.7 `POST /api/stock-takes/{id}/complete`
- **Purpose**: Counting → Pending Approval.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `complete(id)` from `StockTakeCompleteDialogComponent`.

### 17.8 `POST /api/stock-takes/{id}/approve`
- **Purpose**: Pending Approval → Approved.
- **Request**: `{ note?: string }`.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `approve(id, note)` from `StockTakeNoteDialogComponent`.

### 17.9 `POST /api/stock-takes/{id}/reject`
- **Purpose**: Pending Approval → Rejected (returns to Counting for rework).
- **Request**: `{ reason: string }`.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `reject(id, reason)`.

### 17.10 `POST /api/stock-takes/{id}/cancel`
- **Purpose**: Cancel a Draft/Counting session.
- **Request**: `{ reason: string }`.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `cancel(id, reason)`.

### 17.11 `GET /api/stock-takes/{id}/items`
- **Purpose**: Counting Workspace grid + category tree counts.
- **Request (query)**: `categoryId?`, `search?`.
- **Response**: `PagedResponse<StockTakeItem[]>`.
- **Frontend usage**: `getItems(id, filters)`.

### 17.12 `PUT /api/stock-takes/{id}/items`
- **Purpose**: Save Actual Qty/Reason/Notes edits (autosave, batched).
- **Request**: `{ items: Partial<StockTakeItem>[] }`.
- **Response**: `PagedResponse<StockTakeItem[]>`.
- **Frontend usage**: `updateItems(id, items)` (debounced from `StockTakeCountingTableComponent`).

### 17.13 `GET /api/stock-takes/{id}/categories`
- **Purpose**: Category Tree.
- **Response**: `PagedResponse<StockTakeCategoryNode[]>`.
- **Frontend usage**: `getCategories(id)`.

### 17.14 `GET /api/stock-takes/{id}/summary`
- **Purpose**: Floating Summary Panel + Difference Summary card.
- **Response**: `PagedResponse<StockTakeSummary>`.
- **Frontend usage**: `getSummary(id)` (also recomputed client-side on each edit for instant feedback).

### 17.15 `GET /api/stock-takes/{id}/history`
- **Purpose**: History Drawer audit timeline.
- **Response**: `PagedResponse<StockTakeActivity[]>`.
- **Frontend usage**: `getHistory(id)`.

### 17.16 `POST /api/stock-takes/{id}/assign`
- **Purpose**: Assign Counter Dialog.
- **Request**: `{ assignedTo: string; dueDate?: string }`.
- **Response**: `PagedResponse<StockTake>`.
- **Frontend usage**: `assignCounter(id, payload)`.

### 17.17 `GET /api/stock-takes/kpis`
- **Purpose**: Hero Header quick-stat chips.
- **Response**: `PagedResponse<StockTakeKpis>`.
- **Frontend usage**: `getKpis()`.

### 17.18 `GET /api/stock-takes/activities`
- **Purpose**: Activity Rail recent activities feed.
- **Response**: `PagedResponse<StockTakeActivity[]>`.
- **Frontend usage**: `getRecentActivities(limit)`.

### 17.19 `GET /api/warehouses`, `GET /api/departments`, `GET /api/users`
- **Purpose**: Filter Bar / Create Drawer / Assign Dialog lookups.
- **Response**: `PagedResponse<Lookup[]>`.
- **Frontend usage**: `getWarehouses()`, `getDepartments()`, `getUsers()`.

### 17.20 `GET /api/stock-takes/export`
- **Purpose**: Export Excel.
- **Request (query)**: same filters as search.
- **Response**: binary (xlsx) — frontend triggers a download.
- **Frontend usage**: `exportExcel(filters)`.

### 17.21 `POST /api/stock-takes/{id}/print`
- **Purpose**: Print Preview / physical print of a session's count sheet or variance report.
- **Response**: `PagedResponse<PrintRenderResult>` (reuses the existing print-template pipeline).
- **Frontend usage**: `print(id)`, rendered through the existing `PrintPreviewComponent`.

---

## 18. Implementation Notes (frontend, this change)

- New types: `src/app/shared/types/stock-take.types.ts` (kept separate from the legacy
  `stock.types.ts` `StockItem`/`StockTakeSession`, which nothing else references once this module is
  rewritten — left in place only because it's still imported by the old page being replaced here).
- New service: `src/app/services/admin/stock-take.service.ts` (HTTP + mock fallback, `getOr`/`postOr`
  pattern matching `InventoryManagementService`).
- New endpoints block: `BASE_API.STOCK_TAKE` in `src/app/shared/api/base.ts`; new
  `LoadingKeys.STOCK_TAKE` block in `src/app/shared/types/loading.ts`.
- Rewritten list page at the existing route (`admin/pharmacy/stock-take`, component class
  `AdminStockTakeComponent` unchanged so routing/breadcrumbs keep working), composed of the panel
  components listed in §16.
- New route `admin/pharmacy/stock-take/:id/count` → `AdminStockTakeCountingComponent` (Counting
  Workspace), registered as a sibling under the existing `pharmacy` route group.
- Backend is not implemented; all service calls fall back to bundled mock data identical in shape to
  the proposed API responses, so swapping in the real backend later requires no caller changes.
