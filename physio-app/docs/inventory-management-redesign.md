# Inventory Management — Warehouse Management Command Center (WMS) Redesign

## 0. Summary

Replace the current `inventory-management` page (a generic CRUD table with hard-coded mock rows —
see §1) with a **Warehouse Management Command Center**: a multi-zone, real-time operations view
inspired by Amazon Warehouse / SAP EWM / Oracle SCM, scoped for hospital pharmacy inventory. The
pharmacist/warehouse staff should see stock health, expiry risk, movement, and warehouse
utilization on one screen, and act on any of it without navigating away.

This module is **not** a copy of Pharmacy Retail's catalog-and-cart workspace, Prescription
Dispense's queue-and-picking workspace, or a generic admin CRUD table — it borrows shared UI
primitives and a couple of layout conventions from those modules, not their behavior.

---

## 1. UX Audit — Current State

**File:** `src/app/pages/admin/pharmacy/inventory-management/inventory-management.component.ts`

- Single standalone component, inline template, 6 hard-coded `InventoryItem` rows, no service layer
  at all (`this.inventoryItems = [...]` literal array).
- 4 stat cards (Total Items, Low Stock, Out of Stock, Categories) built from raw inline SVGs instead
  of `StatCardComponent`.
- One search box + 2 `<select>` filters, client-side `Array.filter` — no debounce, no batch/expiry
  awareness, no barcode.
- A plain `<table>` with Edit/Delete actions; delete uses `confirm()` (native browser dialog) instead
  of `DialogService`.
- `editItem()`/`openAddModal()`/`exportData()` are `console.log` stubs — nothing actually opens.
- `InventoryItem` (in `shared/types/inventory.ts`) has no batch number, no warehouse zone/shelf, no
  reserved/available split, no unit cost, no supplier history — it cannot represent real pharmacy
  stock (one medicine = many batches, many locations).
- No relationship to `RetailMedicineCard`/`BatchOption` (already defined for retail & dispensing) —
  three different, incompatible "stock" shapes exist in the app today.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | One row per item, no batches | Can't represent FEFO/FIFO, can't show partially-expired stock, can't reconcile with dispensing's `BatchOption` |
| 2 | No warehouse/zone/shelf model | No visibility into *where* stock physically is, no heat map possible |
| 3 | No movement history | No audit trail for receiving, transfers, dispense, disposal, adjustment |
| 4 | No alerts beyond a static status string | Can't surface near-expiry, overstock, discrepancy, temperature excursion, controlled-drug alerts |
| 5 | No insights | Pharmacist must read raw quantity columns and infer urgency manually |
| 6 | `console.log` actions | Receive/Transfer/Adjust/Reserve/Dispose/Print Barcode don't exist |
| 7 | `confirm()` / no toast | Inconsistent with the rest of the app (`DialogService`/`ToastService`) |
| 8 | No service layer | Nothing to swap in a real backend against; no loading/error states possible |

## 3. Information Architecture

```
Inventory Management — Warehouse Command Center
├── Warehouse Health Dashboard (KPI strip, 10 cards, each deep-links a filter)
├── Row 2 — three zones
│   ├── Inventory Explorer        — searchable medicine card browser + Warehouse Heat Map toggle
│   ├── Stock Intelligence        — actionable insight cards + mini trend chart
│   └── Warehouse Activity        — live movement feed (compact, last N events)
├── Row 3 — three zones (scoped to the medicine selected in the Explorer)
│   ├── Inventory Details         — summary card for the selected medicine
│   ├── Batch Management          — batch table (FEFO/FIFO, transfer/lock/dispose)
│   └── Alerts Center             — full alert list, acknowledge + quick actions
├── Warehouse Timeline            — full movement history, filterable by date/medicine/warehouse/user
├── Inventory Detail Drawer       — deep-dive overlay (trend charts, full history, quick actions)
└── Floating Quick Operations     — Receiving, Transfer, Adjustment, Count, Batch Merge/Split, Audit
```

## 4. User Journey

1. Staff opens the command center → KPI strip and all panels load from the warehouse snapshot.
2. Scans the KPI strip for risk (Low Stock, Near Expiry, Out of Stock counts) — clicking a KPI
   filters the Explorer to that subset instantly (no navigation).
3. Searches/browses the Inventory Explorer (by name, generic name, barcode, category, Favorites,
   Recently Accessed) or switches to the **Heat Map** view to see physical warehouse occupancy.
4. Selecting a medicine card populates Inventory Details + Batch Management + scopes the Alerts
   Center to that medicine, all inline — no modal needed for the common case.
5. Opens the **Detail Drawer** ("View Full Detail") for deep analysis: stock/consumption trend
   charts, purchase/dispensing/supplier history, and the same quick actions surfaced at full
   resolution.
6. Performs a Quick Action — Receive Stock, Transfer, Adjust Quantity, Reserve, Dispose Batch, Print
   Barcode — from either the Batch Management row or the Drawer; action posts to the service and
   updates the local snapshot + emits a toast.
7. Acknowledges Alerts Center items as they're resolved; Critical alerts (expired/controlled-drug)
   stay pinned until acknowledged.
8. Reviews the Warehouse Timeline to audit what happened today, filtered by medicine/warehouse/user.
9. Uses the floating Quick Operations menu for warehouse-wide actions that aren't scoped to one
   medicine (Stock Count session, Batch Merge/Split, Inventory Audit) — these route to dedicated
   workflows (Stock Take module reused where applicable) rather than being modeled fully here.

## 5. Layout

Desktop (≥1280px):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Sticky header: title · warehouse selector · last sync time · Refresh             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP — 10 cards, horizontally scrollable, each clickable                     │
├───────────────────────────┬───────────────────────────┬──────────────────────────┤
│ INVENTORY EXPLORER (40%)  │ STOCK INTELLIGENCE (32%)  │ WAREHOUSE ACTIVITY (28%) │
│ search/barcode/category   │ insight cards + mini chart│ live movement feed       │
│ medicine card grid /      │                            │                          │
│ heat map toggle           │                            │                          │
├───────────────────────────┼───────────────────────────┼──────────────────────────┤
│ INVENTORY DETAILS (30%)   │ BATCH MANAGEMENT (40%)    │ ALERTS CENTER (30%)      │
│ selected medicine summary │ batch table, FEFO/FIFO    │ severity-grouped alerts  │
├───────────────────────────┴───────────────────────────┴──────────────────────────┤
│ WAREHOUSE TIMELINE — full-width, filterable, chronological                        │
└──────────────────────────────────────────────────────────────────────────────────┘
Floating Quick Operations button, bottom-right.
Inventory Detail Drawer, overlay from the right (640px).
```

Tablet (768–1279px): Row 2 and Row 3 each collapse to a 2-up grid (`md:grid-cols-2`), with the
third zone in each row dropping to full width below; KPI strip remains horizontally scrollable.

Mobile (<768px): every zone stacks vertically as simplified cards; the Explorer becomes the default
view with Intelligence/Activity/Details/Batches/Alerts reachable via a zone switcher (chip tabs);
Timeline becomes a collapsible accordion; Quick Operations becomes a bottom sheet.

## 6. Warehouse Health Dashboard (KPI Strip)

10 cards, built with `StatCardComponent`, each navigable (click → filters Explorer / scrolls to the
relevant zone): Total Inventory Value, Total Medicines, Available Stock, Reserved Stock, Low Stock
Items, Out of Stock Items, Near Expiry Items, Expired Items, Today's Stock Movements, Pending
Purchase Orders.

## 7. Inventory Explorer

Medicine card per the spec: name, generic name, current stock, safety stock, reorder level, stock
status badge, batch count, expiry indicator (soonest-expiring batch), storage location (primary
zone/shelf). Supports text search (debounced), barcode scan input, category pills (reusing the
`RetailQuickCategory` pattern), Favorites and Recently Accessed toggles (mirrors
`RetailSuggestionMode` from Retail). A view toggle switches the same panel between **List** (card
grid) and **Heat Map** (warehouse zone visualization).

## 8. Warehouse Heat Map

Grid of warehouse zones (Shelf/Cabinet/Refrigerator/Controlled-Drug-Safe), each cell colored by
occupancy/activity: Overstock (amber), Empty (gray), High Activity (primary/blue), Expiring
Inventory present (rose). Clicking a zone filters the Explorer's list view to that location.

## 9. Stock Intelligence

Short, actionable insight cards (e.g. "Stock will last 18 days", "Reorder within 3 days", "Usage
increased 35% this week", "High-value inventory sitting idle", "Overstock detected") plus one
`ngx-charts-line-chart` mini trend (consumption vs. stock level) for the currently selected medicine,
following the exact chart API already used in `AdminAnalyticCardComponent`.

## 10. Warehouse Activity (Row 2, compact) & Warehouse Timeline (Row 4, full)

Both render the same `StockMovementEvent` shape (purchase, receiving, transfer, dispense, retail
sale, return, adjustment, disposal, expiry). The Row 2 feed shows the latest N events compactly; the
Timeline is the same data filterable by date, medicine, warehouse, and user, rendered as a vertical
chronological list grouped by day.

## 11. Batch Management

Per spec: batch number, expiry date, manufacturing date, quantity, reserved quantity, available
quantity, supplier, purchase price, storage location — modeled as `WarehouseBatch` (a superset of
the existing `BatchOption` from `dispensing.ts`, reused rather than duplicated where the shape
overlaps). Actions: switch FEFO/FIFO sort, Transfer, Lock, Dispose — each a row-level quick action
gated by `DialogService.confirm`.

## 12. Alerts Center

Severity-grouped (Critical/High/Warning/Info) list of: Low Stock, Out of Stock, Near Expiry, Expired
Batch, Overstock, Inventory Discrepancy, Temperature Excursion, Controlled Drug Alert. Each alert
has an Acknowledge action and, where applicable, a quick action shortcut (e.g. "Reorder Now" on Low
Stock, "Dispose" on Expired Batch).

## 13. Inventory Detail Drawer

Opened from an Explorer card or "View Full Detail" in Inventory Details. Tabs/sections: Stock
Summary, Batch Details (full `WarehouseBatch[]`), Inventory Trend + Consumption Trend (two
`ngx-charts-line-chart`s), Purchase History, Dispensing History, Supplier History, Warehouse
Locations. Quick Actions pinned at the bottom: Receive Stock, Transfer, Adjust Quantity, Reserve
Stock, Dispose Batch, Print Barcode.

## 14. Warehouse Analytics

Delivered as the trend charts inside Stock Intelligence and the Detail Drawer (Stock Trend,
Consumption Trend) using `ngx-charts-line-chart`. ABC Analysis, Inventory Turnover, Supplier
Performance, Fast/Slow Moving are exposed as Stock Intelligence insight cards in this iteration
(numeric/ranked, not full chart widgets) — flagged in §18 as a follow-up for dedicated
`ngx-charts-bar-chart`/`ngx-charts-pie-chart` widgets once the backend can supply the aggregates.

## 15. Quick Operations (floating)

Floating action button (bottom-right, matches Retail's floating quick-action convention) expands
to: Stock Receiving, Stock Transfer, Stock Adjustment, Stock Count (deep-links to the existing
Stock Take module), Batch Merge, Batch Split, Inventory Audit. Each opens a confirmation via
`DialogService` before posting (full multi-step receiving/count wizards are out of scope for this
pass — see §18).

## 16. Components

Reused as-is: `StatCardComponent`, `StatusBadgeComponent`, `EmptyStateComponent`, `DrawerComponent`,
`DialogService`, `ToastService`, `BooIconComponent`, the Retail catalog-card / category-pill layout
pattern, and the `ngx-charts-line-chart` API from `AdminAnalyticCardComponent`.

New, created only because no existing component covers the need:
`InventoryKpiStripComponent` (wraps `StatCardComponent` with click-to-filter), `InventoryExplorerPanelComponent`,
`WarehouseHeatMapComponent`, `InventoryIntelligencePanelComponent`, `InventoryActivityFeedComponent`,
`InventoryDetailPanelComponent`, `InventoryBatchPanelComponent`, `InventoryAlertsPanelComponent`,
`InventoryTimelinePanelComponent`, `InventoryDetailDrawerComponent`, `InventoryQuickActionsComponent`.

## 17. Responsive Behavior, Accessibility, Page States, Edge Cases, Performance, Scalability

- **Responsive**: see §5 — desktop multi-panel, tablet 2-up collapsible, mobile stacked cards with a
  zone-switcher.
- **Accessibility**: KPI cards and zone cells are buttons with `aria-label`s; alerts use
  `role="alert"` for Critical severity; heat map cells carry text status, not color alone; all
  interactive targets ≥40×40px.
- **Page states**: loading skeleton per panel (independent — Explorer can be ready while Timeline is
  still loading), `EmptyStateComponent` for no-results/no-selection, toast on error with retry,
  disabled state on quick actions when no medicine/batch is selected.
- **Edge cases**: medicine with zero batches (just-added SKU, no stock yet); batch expired but still
  has quantity (must surface as Expired alert and block FEFO auto-pick); barcode scan matching
  multiple batches of the same medicine (resolve to nearest-expiry); warehouse zone at 100%+
  capacity (Overstock highlight even if no single medicine is over its own reorder level).
- **Performance**: Explorer list paginated/virtualized for large catalogs; KPI strip and Activity
  feed poll on an interval rather than every panel independently re-fetching; Timeline always
  server-filtered (date/medicine/warehouse/user), never client-filtered over the full history.
- **Scalability**: `WarehouseBatch` is designed to be the single batch shape shared across Retail,
  Dispensing, and Inventory Management (today each module has its own near-duplicate shape — see
  §18 Enterprise Recommendations) so that a batch picked in Dispensing and a batch shown in
  Inventory are provably the same record.

## 18. Enterprise Recommendations (follow-up, not built in this pass)

- Unify `BatchOption` (dispensing.ts), `RetailMedicineCard`'s batch fields (retail-pos.ts), and the
  new `WarehouseBatch` (inventory-management.ts) into one backend-owned batch entity; today they're
  three independent client shapes that can drift.
- Promote ABC Analysis / Inventory Turnover / Supplier Performance from insight cards to dedicated
  `ngx-charts-bar-chart` / `ngx-charts-pie-chart` widgets once aggregate endpoints exist.
- Multi-step Stock Receiving / Stock Count wizards (currently single confirm-and-post quick actions)
  should become guided flows, reusing the Stock Take module's session model for Stock Count
  specifically.
- Temperature Excursion alerts imply IoT/sensor integration for refrigerated and controlled-drug
  storage — out of scope for the frontend until that telemetry pipeline exists.

---

## 19. Backend API Contract (proposed — not implemented)

All endpoints are namespaced under `/api/pharmacy/inventory/...` and added to `BASE_API.INVENTORY`
in `src/app/shared/api/base.ts`. None of these exist yet; the frontend service falls back to bundled
mock data until they do (same pattern as `RetailPosService`/`DispensingService`).

### 19.1 `GET /api/pharmacy/inventory/kpis`
- **Purpose**: Warehouse Health Dashboard KPI strip.
- **Response**: `PagedResponse<InventoryKpis>` (totalInventoryValue, totalMedicines, availableStock, reservedStock, lowStockCount, outOfStockCount, nearExpiryCount, expiredCount, todayMovementsCount, pendingPurchaseOrders).
- **Frontend usage**: `InventoryManagementService.getKpis()` on load + on refresh interval.

### 19.2 `GET /api/pharmacy/inventory/medicines/search`
- **Purpose**: Inventory Explorer medicine card browser.
- **Request (query)**: `search?`, `category?`, `favoritesOnly?`, `recentOnly?`, `warehouseZone?`, `page`, `pageSize`.
- **Response**: `PagedResponse<PaginationData<InventoryMedicineCard>>`.
- **Frontend usage**: `getMedicines(filters)` in `InventoryExplorerPanelComponent`.

### 19.3 `GET /api/pharmacy/inventory/medicines/barcode/{code}`
- **Purpose**: Barcode-scan lookup in the Explorer search bar.
- **Response**: `PagedResponse<InventoryMedicineCard | null>`.
- **Frontend usage**: `lookupByBarcode(code)`.

### 19.4 `GET /api/pharmacy/inventory/medicines/{medicineId}`
- **Purpose**: Inventory Details panel + Detail Drawer "Stock Summary".
- **Response**: `PagedResponse<InventoryMedicineDetail>`.
- **Frontend usage**: `getMedicineDetail(medicineId)` on Explorer card selection.

### 19.5 `GET /api/pharmacy/inventory/medicines/{medicineId}/batches?sort=FEFO|FIFO`
- **Purpose**: Batch Management panel + Drawer "Batch Details".
- **Response**: `PagedResponse<WarehouseBatch[]>`.
- **Frontend usage**: `getBatches(medicineId, sort)`.

### 19.6 `GET /api/pharmacy/inventory/warehouse/zones`
- **Purpose**: Warehouse Heat Map.
- **Response**: `PagedResponse<WarehouseZone[]>` (zone id/name/type, capacityPercent, activityLevel, hasExpiringStock).
- **Frontend usage**: `getWarehouseZones()` in `WarehouseHeatMapComponent`.

### 19.7 `GET /api/pharmacy/inventory/intelligence?medicineId=`
- **Purpose**: Stock Intelligence insight cards + mini trend, optionally scoped to a medicine.
- **Response**: `PagedResponse<StockInsight[]>`.
- **Frontend usage**: `getInsights(medicineId?)`.

### 19.8 `GET /api/pharmacy/inventory/movements`
- **Purpose**: Warehouse Activity feed + Warehouse Timeline (same shape, different page size/filtering).
- **Request (query)**: `dateFrom?`, `dateTo?`, `medicineId?`, `warehouseZone?`, `userId?`, `page`, `pageSize`.
- **Response**: `PagedResponse<PaginationData<StockMovementEvent>>`.
- **Frontend usage**: `getMovements(filters)` in both `InventoryActivityFeedComponent` (latest N) and `InventoryTimelinePanelComponent` (filtered).

### 19.9 `GET /api/pharmacy/inventory/alerts`
- **Purpose**: Alerts Center.
- **Request (query)**: `medicineId?`, `severity?`, `acknowledged?`.
- **Response**: `PagedResponse<InventoryAlert[]>`.
- **Frontend usage**: `getAlerts(filters)`.

### 19.10 `POST /api/pharmacy/inventory/alerts/{alertId}/acknowledge`
- **Purpose**: Acknowledge an alert.
- **Request**: `{ note?: string }`.
- **Response**: `PagedResponse<InventoryAlert>`.
- **Frontend usage**: `acknowledgeAlert(alertId, note)`.

### 19.11 `POST /api/pharmacy/inventory/batches/{batchId}/receive`
- **Purpose**: Quick Action — Receive Stock.
- **Request**: `{ quantity: number; purchasePrice?: number; supplierId?: string; manufacturingDate?: string; expiryDate?: string }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `receiveStock(batchOrMedicineId, payload)` from Batch Management / Drawer / Quick Operations.

### 19.12 `POST /api/pharmacy/inventory/batches/{batchId}/transfer`
- **Purpose**: Quick Action — Transfer between warehouse zones.
- **Request**: `{ toZoneId: string; quantity: number }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `transferBatch(batchId, payload)`.

### 19.13 `POST /api/pharmacy/inventory/batches/{batchId}/adjust`
- **Purpose**: Quick Action — Adjust Quantity (reconciliation, damage, etc.).
- **Request**: `{ newQuantity: number; reason: string }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `adjustQuantity(batchId, payload)`.

### 19.14 `POST /api/pharmacy/inventory/batches/{batchId}/reserve`
- **Purpose**: Quick Action — Reserve Stock (e.g. for a pending prescription/PO).
- **Request**: `{ quantity: number; reference: string }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `reserveBatch(batchId, payload)`.

### 19.15 `POST /api/pharmacy/inventory/batches/{batchId}/lock`
- **Purpose**: Batch Lock (quarantine — prevent dispensing/transfer pending review).
- **Request**: `{ reason: string }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `lockBatch(batchId, reason)`.

### 19.16 `POST /api/pharmacy/inventory/batches/{batchId}/dispose`
- **Purpose**: Quick Action — Dispose Batch (expired/damaged write-off).
- **Request**: `{ reason: string; quantity: number }`.
- **Response**: `PagedResponse<WarehouseBatch>`.
- **Frontend usage**: `disposeBatch(batchId, payload)`.

### 19.17 `GET /api/pharmacy/inventory/batches/{batchId}/barcode`
- **Purpose**: Quick Action — Print Barcode.
- **Response**: `PagedResponse<{ barcodeImageUrl: string }>`.
- **Frontend usage**: `printBarcode(batchId)`.

### 19.18 `GET /api/pharmacy/inventory/medicines/{medicineId}/history?type=purchase|dispensing|supplier`
- **Purpose**: Drawer's Purchase/Dispensing/Supplier History tabs.
- **Response**: `PagedResponse<PaginationData<InventoryHistoryEntry>>`.
- **Frontend usage**: `getHistory(medicineId, type)`.

---

## 20. Implementation Notes (frontend, this change)

- New types: `src/app/shared/types/inventory-management.ts` (kept separate from the legacy
  `inventory.ts`/`stock.ts`, which the unrelated Stock Take module still uses).
- New service: `src/app/services/admin/inventory-management.service.ts` (HTTP + mock fallback,
  `getOr/postOr` pattern matching `RetailPosService`/`DispensingService`).
- New endpoints block: `BASE_API.INVENTORY` in `src/app/shared/api/base.ts`.
- Rewritten page at the existing route (`admin/pharmacy/inventory-management`, component class
  `AdminInventoryManagementComponent` unchanged so routing/breadcrumbs keep working), composed of:
  `inventory-kpi-strip.component.ts`, `inventory-explorer-panel.component.ts`,
  `warehouse-heatmap.component.ts`, `inventory-intelligence-panel.component.ts`,
  `inventory-activity-feed.component.ts`, `inventory-detail-panel.component.ts`,
  `inventory-batch-panel.component.ts`, `inventory-alerts-panel.component.ts`,
  `inventory-timeline-panel.component.ts`, `inventory-detail-drawer.component.ts`,
  `inventory-quick-actions.component.ts`.
- Backend is not implemented; all service calls fall back to bundled mock data identical in shape
  to the proposed API responses, so swapping in the real backend later requires no caller changes.
