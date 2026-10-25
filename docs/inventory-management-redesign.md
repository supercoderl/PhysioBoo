# Inventory Management — Redesign

Route: `/admin/pharmacy/inventory-management` · Guard: `pharmacy:medicine-inventory:read`
Status: implemented. Verified against `physio-server` (`InventoryEndpoints.cs`, `SearchMedicinesQueryHandler`, `ChangeBatchCommandHandler`, `GetInventoryKpisQueryHandler`).

---

## 1. UX Audit (previous page)

The previous page was a 7-panel "warehouse command centre": KPI strip, explorer, intelligence, activity feed, detail, batch, alerts, timeline, a heat-map and a floating quick-action menu. Each panel sat in a fixed-height box (`h-[560px]`, `h-[420px]`).

| Area | Finding |
|---|---|
| Hierarchy | Ten equally weighted panels; nothing says "start here". |
| Scrolling | Every panel scrolled on its own inside fixed heights, so the page had nested scroll areas and clipped content on short screens. |
| Search | The explorer never sent `search`, `pageNumber` or `pageSize`; the backend requires paging parameters, so the list did not reflect the controls. |
| Actions | Receive / Transfer / Adjust / Merge / Split from the floating menu only showed "not available yet". Reserve and Dispose in the drawer fired requests with hard-coded quantities (`quantity: 1`, whole batch) and reported success before the response. |
| Contract drift | History was typed as paged but the API returns a list; history `type` sent `purchase`/`dispensing`/`supplier` but the API takes a `StockMovementType`; `BatchLifecycleStatus` is serialised as a number (no string enum converter is configured) but was typed as a string. |
| Honesty of data | "Low stock" / "near expiry" tiles were presented as medicine counts; the API counts **batches**. |
| Permissions | One read permission was used for everything; the API requires create / update / delete per action. |

## 2. Current Problems (to solve)

1. No clear task flow: find a medicine → see its stock and batches → change a batch.
2. Mutations were fake or unsafe (no form, no validation, no confirmation of the real quantity).
3. Unreliable search and paging.
4. Misleading KPI wording.
5. Permission-blind UI.

## 3. Information Architecture

```
Inventory (page)
├─ Header: title, context line, actions  [Refresh] [Stock take →]
├─ Overview: 5 indicators (from /kpis)
├─ Toolbar: search · category · reset · active-filter chips
├─ Medicine list (paged table)
│    row click / "View stock" → Medicine panel
└─ Medicine panel (right drawer)
     ├─ Header: name, generic name, status
     ├─ Summary: on hand, reorder level, safety stock, unit, avg cost, value, locations
     ├─ Tab Batches: batch rows with per-row actions
     └─ Tab History: movement log for the medicine
Batch action dialog: Receive · Adjust · Transfer · Dispose
```

Not on the page (no real API, or no safe reverse operation): reserve and lock (one-way), merge/split, alerts and "intelligence" panels, warehouse heat-map, barcode printing, creating a new batch (see §14).

## 4. User Journey

1. Pharmacist opens the page and reads the overview (any red numbers?).
2. Types a name / generic name / barcode, optionally narrows by category.
3. Opens a medicine; checks on-hand vs. reorder level and the FEFO-ordered batches.
4. Fixes stock on a batch: receive a delivery, correct a count (adjust), move to a zone (transfer), write off (dispose). Each asks only for what the API needs, validates inline and keeps its values if the server refuses.
5. The panel and list refresh; the toast confirms.

## 5. Layout

Desktop-first, normal page scroll only (no fixed-height panels).

```
┌──────────────────────────────────────────────────────────────┐
│ Inventory                                   [Refresh][Stock take]│
│ Medicines, on-hand stock and batches                          │
├──────────────────────────────────────────────────────────────┤
│ [Medicines] [Stock value] [Low-stock batches] [Near-exp.] [Expired]│
├──────────────────────────────────────────────────────────────┤
│ [ Search …………………………… ] [ Category ▾ ] [Reset]               │
│ (chips)                                                       │
├──────────────────────────────────────────────────────────────┤
│ Medicine            Category  On hand  Reorder  Status  Expiry  ⋯│
│ ...                                                           │
│ Showing 1–20 of N                              « 1 2 3 »      │
└──────────────────────────────────────────────────────────────┘
```

Page gutters `px-4 sm:px-6`, vertical rhythm `space-y-4`. Cards use `rounded-2 border border-borderGray/60 bg-surface`.

## 6. Wireframes — Medicine panel (640 px drawer)

```
┌ Paracetamol 500mg                         [✕] ┐
│ Acetaminophen · Acme Pharma     ● Low stock    │
├────────────────────────────────────────────────┤
│ On hand 42 box │ Reorder 50 │ Safety 20         │
│ Avg cost $1.20 │ Value $50.40 │ Locations …     │
├ Batches (3) | History ─────────────────────────┤
│ B-2210  exp 12 Mar 2027   on hand 30 · free 25  │
│   Zone A · Supplier X · $1.10      [Receive][⋯] │
└────────────────────────────────────────────────┘
```

## 7. Component Hierarchy

```
AdminInventoryManagementComponent            (page, state owner)
├─ InventoryKpiStripComponent                (boo-stat-card ×5)
├─ InventoryFilterBarComponent               (boo-input, boo-select, boo-filter-chips)
├─ InventoryMedicineTableComponent           (boo-table-admin, boo-status-badge, boo-action-admin)
├─ InventoryDetailDrawerComponent            (drawer)
│   └─ InventoryBatchActionDialogComponent   (Receive/Adjust/Transfer/Dispose)
└─ ToastService                              (success feedback; API errors are toasted by the interceptor)
```

Removed: explorer, intelligence, activity-feed, detail-panel, batch-panel, alerts-panel, timeline, heat-map, quick-actions (superseded, not reused).

## 8. UI Specification

* Buttons: `@physioboo/ui` `boo-button` (`primary`, `secondary`, `ghost`, `sm`/`md`).
* Search: `boo-input` (debounced `search` output, 500 ms), same 44 px height as `boo-select`.
* Category: `boo-select` (searchable when ≥ 8 options). Date: `boo-datepicker` (receive expiry).
* Status: `boo-status-badge` — In stock = success, Low stock = warning, Out of stock = danger. Batch: Active = success, Reserved = primary, Locked = warning, Expired = danger, Disposed = neutral.
* Numbers: right-aligned, `tabular-nums`, thousands separators. Money formatted with the `currency` pipe (the rest of the app shows `$`).
* Units: only where the API returns one (`unit` in the medicine detail). The list endpoint has no unit, so list quantities carry none.
* Dates: `mediumDate`. Expiry within the API's `isNearExpiry` flag is highlighted amber, `isExpired` red.

## 9. Interaction Design

* Search is debounced; changing search or category resets to page 1. Stale responses are dropped (`switchMap`).
* Row click and "View stock" open the panel; Esc / backdrop / ✕ closes it.
* Row/batch actions are permission-gated (§12) and hidden when not allowed.
* Dialogs: Enter submits, Esc cancels, the submit button is disabled while a request is in flight (no double submit), values are kept after a failure, the dialog closes only on success.
* The Dispose dialog carries an explicit irreversibility note and a destructive-styled submit button; Escape closes the dialog first, then the panel.
* After a successful mutation: batches + detail of the open medicine, the list row page and the KPIs are re-fetched.

## 10. Responsive Behaviour

* ≥ lg: five indicators in one row; table full width.
* md: indicators wrap 3 + 2; filter bar 2 columns.
* < md: indicators 2 columns; filter controls stack; the table scrolls horizontally inside its card (the page itself never scrolls sideways); drawer is clamped to the viewport width.
* Touch targets ≥ 40 px (library button sizes).

## 11. Accessibility

* Table has a header row and real `<button>` row triggers; icon buttons have `aria-label`.
* Status is never colour-only (text label inside the badge).
* Dialog: `role="dialog"`, `aria-modal`, labelled by its title, focus moves to the first field on open and returns on close, Esc closes.
* Errors: `role="alert"` (library states, field errors). Success/failure toasts are announced by the existing toast service.
* Contrast follows the existing tokens (text-regular / text-secondary on surface).

## 12. Permissions (enforced by the API, mirrored in the UI)

| UI | Endpoint | Permission |
|---|---|---|
| Page, list, detail, batches, history, KPIs | `GET …/kpis`, `…/medicines/*` | `pharmacy:medicine-inventory:read` |
| Receive stock | `POST …/batches/{id}/receive` | `…:create` |
| Adjust, Transfer | `POST …/batches/{id}/adjust`, `…/transfer` | `…:update` |
| Dispose | `POST …/batches/{id}/dispose` | `…:delete` |
| Zone list (Transfer destination) | `GET …/warehouse/zones` | `pharmacy:warehouse-zone:read` |

Without a write permission the action is hidden; the read-only panel still works. Without zone-read, Transfer is hidden.

## 13. Page States

| State | Behaviour |
|---|---|
| Loading | Table skeleton rows; KPI dashes; drawer sections show skeletons. |
| Empty (no data) | `boo-empty-state`: "No medicines yet". |
| Empty (filtered) | "No medicines match" with a Reset action. |
| Error | List: `boo-error-state` panel with Retry. KPIs / batches / history: `boo-inline-error` (the rest keeps working). |
| Forbidden | The route guard handles page access; a 403 on an action shows the interceptor's toast. |
| Success | Toast naming the batch and the quantity. |
| Disabled | Submit disabled while invalid or in flight. |

## 14. Edge Cases and Backend Limits

Verified in the backend; the UI does not hide them.

1. **Stock-status filter is applied after paging** in `SearchMedicinesQueryHandler`. A status filter would return short or empty pages with an unfiltered total, so the page does **not** offer one. Needs a server-side fix (§16).
2. **KPI counts are per batch**, not per medicine (`lowStockCount`, `outOfStockCount`, `nearExpiryCount`, `expiredCount`). Labels say "batches". `pendingPurchaseOrders` is always 0 and is not shown. `outOfStockCount` includes empty batches, so it is not shown either.
3. **Medicine status** is `currentStock <= sum(batch reorder levels)` → Low stock; it is the API's value.
4. **No expiry-date filter, no sort, no unit in the list** — none are offered.
5. **No release for reserve, no unlock for lock** — both would be one-way, so neither is exposed.
6. **Creating a new batch** (`POST api/medicine-inventories/create`) needs a hospital id and supplier id and creates it with no quantity; a new-batch flow is not offered. Receiving adds stock to an **existing** batch.
7. Transfer to a different zone with part of the quantity splits the batch server-side; a same-zone transfer is refused by the API.
8. Adjust cannot go below the reserved quantity; Dispose / Transfer are limited to unreserved units. The dialogs pre-validate with the same numbers.
9. History quantities are signed only for adjustments; other movements are positive, so the UI shows the movement type next to the number and never guesses a sign.
10. Enum values arrive as numbers; the service normalises them.

## 15. Performance and Scalability

* Server-side paging (20 per page); one list request per interaction; `switchMap` cancels superseded requests.
* Batches and history load only when the panel opens / the tab is first shown.
* Zones and categories are fetched once and cached for the page lifetime.
* No client-side filtering of paged data.

## 16. Enterprise Recommendations / Requested Backend Changes (not implemented here)

1. Apply the stock-status filter in SQL (or aggregate before paging) and return a correct `totalCount`.
2. Return per-medicine KPI counts (or label them as batches in the contract).
3. Add `unit` and a sort parameter to `medicines/search`.
4. Add `expiryBefore` filter on `medicines/search`.
5. A "create batch with initial quantity" command that infers hospital from the session.
6. Release-reservation and unlock operations.

---

## Proposed / consumed API contract

All responses are `ResponseMessage<T> { success, data, errors }`. Paged results: `{ items, pageNumber, pageSize, totalCount, totalPages, hasNext, hasPrevious }`.

| Purpose | Method + URL | Request | Response `data` | Frontend usage |
|---|---|---|---|---|
| Overview | `GET /api/pharmacy/inventory/kpis` | – | `InventoryKpis` | KPI strip |
| List medicines | `GET /api/pharmacy/inventory/medicines/search` | query `search?`, `categoryId?`, `pageNumber`, `pageSize` (paging params are required) | `Paged<MedicineStock>` | Table |
| Medicine detail | `GET /api/pharmacy/inventory/medicines/{id}` | – | `MedicineStockDetail \| null` | Panel summary |
| Batches | `GET /api/pharmacy/inventory/medicines/{id}/batches` | – | `WarehouseBatch[]` (earliest expiry first) | Batches tab |
| History | `GET /api/pharmacy/inventory/medicines/{id}/history` | query `type?` | `HistoryEntry[]` | History tab |
| Zones | `GET /api/pharmacy/inventory/warehouse/zones` | – | `WarehouseZone[]` | Transfer destination |
| Receive | `POST /api/pharmacy/inventory/batches/{id}/receive` | `{ quantity, purchasePrice?, supplierId?, manufacturingDate?, expiryDate? }` | updated `WarehouseBatch` | Receive dialog |
| Adjust | `POST /api/pharmacy/inventory/batches/{id}/adjust` | `{ newQuantity, reason }` | updated batch | Adjust dialog |
| Transfer | `POST /api/pharmacy/inventory/batches/{id}/transfer` | `{ toZoneId, quantity }` | updated batch | Transfer dialog |
| Dispose | `POST /api/pharmacy/inventory/batches/{id}/dispose` | `{ reason, quantity }` | updated batch | Dispose dialog |
| Categories | `POST /api/medicine-categories/search` | paged request | `Paged<MedicineCategory>` | Category filter |

Proposed additions are listed in §16. No backend code was changed.
