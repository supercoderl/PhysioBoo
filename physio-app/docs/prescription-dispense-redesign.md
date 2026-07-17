# Prescription Dispense — Clinical Dispensing Workspace Redesign

## 0. Summary

Replace the current `prescription-dispense` page (a single hard-coded search form with an empty
medication table — see §1) with a **Clinical Dispensing Workspace**: a continuous, single-screen,
queue-driven workflow modeled on hospital pharmacy dispensing systems (Epic Willow, Oracle Health
Pharmacy) rather than a retail POS or generic dashboard. The pharmacist works one prescription at a
time, picked from a live queue, through Verification → Picking → Barcode Validation → Packaging →
Dispensed, with clinical safety gates (allergy/interaction/high-alert acknowledgement) enforced
before completion.

This module is intentionally **not** a copy of Pharmacy Retail (`pharmacy/retail`) — there is no
cart, no payment dialog, no catalog browsing. It reuses the *shape* of that module's 3-panel
workspace and shared UI primitives, not its checkout-oriented behavior.

---

## 1. UX Audit — Current State

**File:** `src/app/pages/admin/pharmacy/prescription-dispense/prescription-dispense.component.ts`

- Single standalone component, inline template, `[(ngModel)]` two-way binding, no signals.
- Two free-text inputs ("Prescription ID", "Patient ID") with a manual "Search" button — no queue,
  no list of pending prescriptions.
- Patient header is static markup with placeholder text ("Da", "12") — never bound to real data.
- Medication table renders **zero rows** (`<tbody>` is empty; `currentPrescription` is never
  populated by `searchPrescription()`).
- All feedback uses `alert()` instead of `ToastService` / `DialogService`.
- "Recent Dispenses" table uses hard-coded mock array, no pagination, no real status model.
- No clinical safety surface at all: no allergy/interaction/duplicate/high-alert checks, no
  acknowledgement gate before dispensing.
- No inventory awareness: no batch, no expiry, no FEFO/FIFO, no shelf/location, no stock validation.
- No barcode support, no keyboard-first workflow.
- No drawer/dialog usage despite both being available app-wide.
- Imports the legacy, thin `Prescription` type (`medication/dosage/frequency/duration` only) — no
  room for clinical metadata.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | No queue — pharmacist must already know a Prescription ID/Patient ID | Cannot triage workload, no priority handling, no walk-up visibility |
| 2 | No clinical decision support | Allergy/interaction/duplicate/high-alert errors are not caught before dispensing — patient safety risk |
| 3 | No inventory/batch/expiry handling | No FEFO enforcement, no way to guarantee correct batch is dispensed |
| 4 | No partial dispense / hold / cancel workflow | Pharmacist cannot defer an item that's out of stock without losing the whole prescription |
| 5 | No barcode / keyboard-first interaction | Slower, more error-prone than physical pharmacy hardware expects |
| 6 | No audit trail (pharmacist, timestamps, batch used) | No traceability for regulatory/compliance review |
| 7 | `alert()` for all feedback | Inconsistent with app-wide Toast/Dialog patterns, blocks the thread, not screen-reader friendly |
| 8 | No empty/loading/error states | Page looks broken until data exists; no feedback during async calls |

## 3. Information Architecture

```
Prescription Dispense Workspace
├── Queue (left)            — list of prescriptions awaiting/being dispensed
├── Dispensing Workspace (center)
│   ├── Patient & Clinical Context   — patient summary, diagnosis, allergies, risk flags
│   ├── Clinical Alerts              — interaction/allergy/duplicate/high-alert, severity-ranked
│   ├── Dispensing Progress          — 8-stage stepper
│   └── Picking List                 — one row per medication, pick-to-dispense actions
└── Summary (right)
    ├── Dispensing Summary  — counts, insurance/payment, pharmacist, elapsed time
    └── Complete Dispensing — primary action, disabled until gates are satisfied

Medication Drawer (overlay, opened from a picking-list row)
└── Detail · Batch & Expiry · Stock & Location · Alternatives · Interactions · Dispensing History
```

## 4. User Journey

1. Pharmacist opens the workspace → queue auto-loads, sorted by priority then created time.
2. Selects a **Waiting** prescription → it loads into the center workspace and moves to
   **Verifying**.
3. Reviews patient context, diagnosis, allergies; **Clinical Alerts** panel surfaces any
   interaction/allergy/duplicate/high-alert warnings. Critical/High severity alerts must be
   acknowledged individually before the item (or the whole prescription, for Critical) can proceed.
4. For each medication line in the **Picking List**:
   a. Confirms/selects batch (FEFO-suggested batch pre-selected; pharmacist can override).
   b. Scans or confirms barcode (medicine + batch) — on mismatch, item is flagged and blocked.
   c. Marks the line **Picked**, optionally adjusting dispensed quantity (partial dispense) or
      replacing the medicine (with pharmacist justification).
   d. Out-of-stock items can be **Reserved** (back-order) or held without blocking other lines.
5. Once every line is Picked/Resolved and all Critical alerts are acknowledged, **Complete
   Dispensing** activates.
6. Pharmacist completes → prescription status becomes **Dispensed → Completed**; summary panel
   shows final counts; queue advances to the next Waiting item automatically (configurable).
7. At any point: **Hold** (with reason) returns the prescription to the queue as On Hold; **Cancel**
   requires a reason and confirmation dialog.

## 5. Layout

Desktop (≥1280px) — three-column workspace, no scrolling of the page itself, only of panel
contents:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Sticky header: title · pharmacist · shift · queue stats · Auto-refresh toggle      │
├───────────────┬───────────────────────────────────────────────┬───────────────────┤
│ QUEUE (22%)   │ DISPENSING WORKSPACE (54%)                     │ SUMMARY (24%)     │
│ Search/filter │ Patient & Clinical Context card (sticky)       │ Dispensing Summary│
│ Priority tabs │ Clinical Alerts panel (collapsible)            │ counts, payment   │
│ Queue cards   │ Progress stepper (8 stages)                    │ pharmacist, time  │
│ (scrollable)  │ Picking List (scrollable, one row per med)     │ Complete button   │
│               │ Dispensing notes                               │ Quick actions     │
└───────────────┴───────────────────────────────────────────────┴───────────────────┘
```

Tablet (768–1279px): Queue collapses to a horizontal drawer/toggle; Workspace + Summary become a
2-column grid (`md:grid-cols-2`), Summary panel moves to the bottom on narrower tablets.

Mobile (<768px): single column — Queue, Workspace, Summary stack vertically; sticky bottom action
bar holds Complete/Hold/Cancel; Medication Drawer becomes full-screen.

## 6. Wireframes (textual)

```
QUEUE CARD                              PICKING LIST ROW
┌─────────────────────────┐             ┌─────────────────────────────────────────────┐
│ #12  RX-2026-00451  🔴Hi │             │ ☐ Amoxicillin 250mg · Strip of 10            │
│ Pham Thi Lan  MRN-009211 │             │   Shelf A-12 · Batch BT2024002 · Exp 08/2025 │
│ Ward: Internal Medicine  │             │   Qty 20 / 20      [Batch ▾] [Replace] [Scan]│
│ Dr. Nguyen Van A · 3 meds│             │   ⚠ Allergy: Penicillin family — ACK required│
│ 08:42  [Waiting]         │             └─────────────────────────────────────────────┘
└─────────────────────────┘
```

```
PROGRESS STEPPER
Received ─ Clinical Verification ─ Inventory Picking ─ Barcode Validation ─ Packaging ─ Ready ─ Dispensed ─ Completed
   ●               ●                       ◐                    ○                ○        ○         ○            ○
```

## 7. Component Hierarchy

```
AdminPrescriptionDispenseComponent (shell)
├── DispenseQueuePanelComponent           (left)
├── DispensePickingPanelComponent         (center)
│   ├── uses StatusBadgeComponent, BooIconComponent
│   └── DispenseProgressStepperComponent  (8-stage stepper, reusable)
├── DispenseSummaryPanelComponent         (right)
└── DispenseMedicationDrawerComponent     (overlay, wraps shared DrawerComponent)
```

Shared components reused as-is: `DrawerComponent`, `DialogService`, `ToastService`,
`StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`,
`BooInputComponent`, `BooSelectComponent`.

## 8. UI Specification

- **Queue card**: queue number, prescription number, patient name, MRN, ward/clinic, priority dot
  (Critical/High/Normal), prescribing doctor, medication count, created time (relative), status
  badge. Click = select & load.
- **Patient & Clinical Context card**: name, MRN, age/gender, allergies (chips, danger tone),
  chronic conditions, diagnosis, insurance, risk flags (pregnancy/pediatric/elderly/high-risk) as
  small icon badges.
- **Clinical Alerts panel**: grouped by severity (Critical/High/Warning/Info), each row shows
  type, message, recommendation, Acknowledge button. Critical alerts pin to the top and block
  Complete Dispensing until acknowledged.
- **Picking list row**: checkbox/pick state, medicine name + strength + form, shelf location,
  batch + expiry (FEFO-selected, editable via Batch Selector), qty prescribed vs qty to dispense
  (editable for partial dispense), status badge (Not Picked/Picked/Verified/Dispensed/On
  Hold/Replaced), inline actions (Replace, Partial, Reserve, Cancel Item) plus a barcode capture
  affordance.
- **Progress stepper**: 8 stages per the spec; current stage highlighted, completed stages check-marked.
- **Summary panel**: items dispensed/remaining counters, inventory changes count, insurance amount,
  patient payment, elapsed dispensing time, pharmacist name, large **Complete Dispensing** button
  (disabled state + tooltip reason when blocked).
- **Medication Drawer**: medicine detail, batch & expiry list (FEFO ordering, select to override),
  current stock by location, alternative medicines (with switch action), manufacturer, interaction
  warnings, dispensing history for this patient/medicine.

## 9. Interaction Design

- Selecting a queue card is the only way to load a prescription into the workspace (single active
  prescription at a time — mirrors the spec's "remain on one screen").
- Picking a medication row opens the Medication Drawer; closing the drawer returns focus to the
  same row.
- Acknowledging a Critical/High alert requires an explicit click (no bulk "acknowledge all" for
  Critical) — logged with pharmacist + timestamp (placeholder service call).
- Replace Medicine, Partial Dispense, Cancel Item, Reserve Item are row-level quick actions exposed
  as icon buttons with text on hover/focus (touch target ≥40px).
- Complete Dispensing, Hold, and Cancel use `DialogService.confirm(...)` for irreversible/blocking
  actions; everyday feedback (item picked, batch selected, alert acknowledged) uses `ToastService`.
- Barcode input is a dedicated, always-focusable input (`Ctrl+B` to focus) that accepts
  prescription/medicine/batch/package barcodes and routes them by prefix.

## 10. Responsive Behavior

See §5. Breakpoints align with the rest of the app (`md:` ~768px, `lg:` ~1280px, matching
`retail.component.ts`'s `md:grid-cols-2 lg:grid-cols-[2fr_1.6fr_1.4fr]` convention).

## 11. Accessibility

- All interactive row actions have visible focus rings and `aria-label`s (icon-only buttons).
- Critical alerts use `role="alert"` and are announced when they appear.
- Queue list and picking list are keyboard-navigable (`Tab`/`Arrow` between rows, `Enter` to
  open/select).
- Color is never the only signal — status badges always carry text, severity icons accompany alert
  color coding.
- Touch targets ≥40×40px for row actions; drawer content scrollable independent of page.

## 12. Page States

- **Loading**: skeleton rows in queue panel; workspace shows a centered spinner/`EmptyState`-style
  placeholder until a prescription is selected.
- **Empty queue**: `EmptyStateComponent` ("No prescriptions waiting").
- **No selection**: workspace center shows `EmptyStateComponent` ("Select a prescription from the
  queue to begin verification").
- **Error** (load failure): toast error + retry affordance in panel header.
- **Success**: toast confirmation on dispense completion; queue card transitions to Completed and
  fades from the active queue list.
- **Disabled**: Complete Dispensing button disabled while any line is Not Picked or any
  Critical alert is unacknowledged; tooltip explains why.

## 13. Edge Cases

- Out-of-stock medicine with no substitute available → line stays blocked, prescription can still
  be partially dispensed for the remaining lines, blocked line is flagged for pharmacy restock.
- Expired/near-expiry batch selected → Batch Selector visually flags it and requires explicit
  override confirmation.
- Barcode scan doesn't match expected medicine/batch → toast error, line stays Not Picked.
- Patient has no structured allergy data (legacy `Patient.allergyInformation` is free text) → fall
  back to displaying the free-text string in the Patient & Clinical Context card with a "Free-text
  allergy — verify manually" note (documented gap, see §15 Enterprise Recommendations).
- Prescription cancelled mid-dispense by a doctor (external event) → queue card flips to Cancelled,
  workspace shows a banner if it was the active selection, blocking further picking.

## 14. Performance Considerations

- Queue list paginated/virtualized for high-volume pharmacies (reuse `PaginationData<T>` /
  `BooTableComponent` virtualization patterns already in the codebase).
- Debounced search (300ms) on the queue search box, matching `prescription.component.ts`'s
  `debounceTime` pattern.
- Workspace loads a single prescription's data on demand (`getWorkspace(queueId)`), not the whole
  queue payload.
- Memoize derived workspace flags (e.g. "can complete") via `computed()` rather than recalculating
  in the template.

## 15. Scalability & Enterprise Recommendations

- Promote `Allergy` (structured) onto `Patient`/`RxPatientSummary` consistently so dispensing,
  prescribing, and retail all read the same structured allergy list instead of free text.
- Centralize clinical warning evaluation (`ClinicalWarning` from `prescription-rx.ts`) into one
  backend CDS service consumed by Prescription Entry, Dispensing, and Retail alike, so warnings
  raised at prescribing time persist into dispensing instead of being recomputed/duplicated.
- Dispensing audit log (pharmacist, batch, timestamp per line) should be a first-class backend
  entity for regulatory traceability — proposed as part of the API contract below.
- FEFO/FIFO batch suggestion should be computed server-side (single source of truth for stock
  ledger) and only rendered client-side.

---

## 16. Backend API Contract (proposed — not implemented)

All endpoints are namespaced under `/api/pharmacy/dispensing/...` and added to `BASE_API.DISPENSING`
in `src/app/shared/api/base.ts`. None of these exist yet; the frontend service falls back to bundled
mock data until they do (same pattern as `RetailPosService`).

### 16.1 `GET /api/pharmacy/dispensing/queue`
- **Purpose**: List prescriptions awaiting/in dispensing, for the left Queue panel.
- **Request (query)**: `search?`, `status?` (`Waiting|Verifying|Preparing|Dispensing|Completed|Cancelled|OnHold`), `priority?`, `page`, `pageSize`.
- **Response**: `PagedResponse<PaginationData<DispenseQueueItem>>`.
- **Frontend usage**: `DispensingService.getQueue(filters)`, polled/refreshed on auto-refresh toggle.

### 16.2 `GET /api/pharmacy/dispensing/queue/{queueId}/workspace`
- **Purpose**: Load full dispensing workspace (patient context, diagnosis, items, alerts, progress) for a selected queue entry.
- **Request**: path `queueId`.
- **Response**: `PagedResponse<DispenseWorkspace>`.
- **Frontend usage**: `DispensingService.getWorkspace(queueId)` on queue card click.

### 16.3 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/alerts/{alertId}/acknowledge`
- **Purpose**: Record pharmacist acknowledgement of a clinical alert (required gate for Critical/High severity).
- **Request**: `{ note?: string }`.
- **Response**: `PagedResponse<ClinicalWarning>` (updated, `acknowledged: true`).
- **Frontend usage**: `DispensingService.acknowledgeAlert(workspaceId, alertId, note)`.

### 16.4 `PATCH /api/pharmacy/dispensing/workspace/{workspaceId}/items/{itemId}`
- **Purpose**: Update a picking-list line — quantity to dispense, picked state, selected batch, shelf override.
- **Request**: `{ qtyToDispense?: number, status?: DispenseItemStatus, batchNo?: string }`.
- **Response**: `PagedResponse<DispenseMedicationItem>`.
- **Frontend usage**: `DispensingService.updateItem(workspaceId, itemId, patch)` — quantity edits, batch selection, pick/unpick toggle.

### 16.5 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/items/{itemId}/replace`
- **Purpose**: Swap a medicine line for an approved alternative.
- **Request**: `{ alternativeMedicineId: string, reason: string }`.
- **Response**: `PagedResponse<DispenseMedicationItem>`.
- **Frontend usage**: `DispensingService.replaceItem(...)` from the Medication Drawer's Alternatives tab / row Quick Action.

### 16.6 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/items/{itemId}/reserve`
- **Purpose**: Mark an out-of-stock line as reserved/back-ordered instead of blocking the whole prescription.
- **Request**: `{ note?: string }`.
- **Response**: `PagedResponse<DispenseMedicationItem>`.
- **Frontend usage**: Quick Action "Reserve Item".

### 16.7 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/items/{itemId}/scan`
- **Purpose**: Validate a barcode scan (medicine/batch/package) against the expected line.
- **Request**: `{ barcode: string }`.
- **Response**: `PagedResponse<{ matched: boolean; item: DispenseMedicationItem }>`.
- **Frontend usage**: Barcode input handler routes scans here when a line is focused.

### 16.8 `GET /api/pharmacy/dispensing/medicines/{medicineId}/batches?warehouseId=`
- **Purpose**: Fetch available batches (FEFO-ordered) + stock by location for the Batch Selector / Medication Drawer.
- **Response**: `PagedResponse<BatchOption[]>`.
- **Frontend usage**: `DispensingService.getBatches(medicineId)`.

### 16.9 `GET /api/pharmacy/dispensing/medicines/{medicineId}/detail?patientId=`
- **Purpose**: Medication Drawer content — detail, alternatives, interaction warnings, dispensing history for this patient.
- **Response**: `PagedResponse<DispenseMedicineDetail>`.
- **Frontend usage**: `DispensingService.getMedicineDetail(medicineId, patientId)` when the drawer opens.

### 16.10 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/hold`
- **Purpose**: Put the prescription on hold with a reason; returns it to the queue as `OnHold`.
- **Request**: `{ reason: string }`.
- **Response**: `PagedResponse<DispenseQueueItem>`.
- **Frontend usage**: `DispensingService.holdPrescription(workspaceId, reason)` from Summary panel / Hold action.

### 16.11 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/cancel`
- **Purpose**: Cancel the whole prescription dispense with a reason.
- **Request**: `{ reason: string }`.
- **Response**: `PagedResponse<DispenseQueueItem>`.
- **Frontend usage**: `DispensingService.cancelPrescription(workspaceId, reason)`, gated by `DialogService.confirm`.

### 16.12 `POST /api/pharmacy/dispensing/workspace/{workspaceId}/complete`
- **Purpose**: Finalize dispensing — commits inventory deductions, writes the audit log, advances status to `Completed`.
- **Request**: `{ pharmacistNotes?: string }`.
- **Response**: `PagedResponse<DispenseSummary>`.
- **Frontend usage**: `DispensingService.completeDispensing(workspaceId, notes)` from the Summary panel's Complete button.

### 16.13 `GET /api/pharmacy/dispensing/stats`
- **Purpose**: Header stats — pending count, in-progress count, completed-today count, average dispensing time.
- **Response**: `PagedResponse<DispenseQueueStats>`.
- **Frontend usage**: Sticky header stat strip (optional `StatCardComponent` row, parity with Retail's insight strip).

---

## 17. Implementation Notes (frontend, this change)

- New types: `src/app/shared/types/dispensing.ts`.
- New service: `src/app/services/admin/dispensing.service.ts` (HTTP + mock fallback, same
  `getOr/postOr/patchOr` pattern as `RetailPosService`).
- New endpoints block: `BASE_API.DISPENSING` in `src/app/shared/api/base.ts`.
- Rewritten page at the existing route (`admin/pharmacy/prescription-dispense`, component class
  `AdminPrescriptionDispenseComponent` unchanged so routing/breadcrumbs keep working):
  - `prescription-dispense.component.ts` — shell, signals-based state, keyboard shortcuts.
  - `dispense-queue-panel.component.ts`
  - `dispense-picking-panel.component.ts`
  - `dispense-progress-stepper.component.ts`
  - `dispense-summary-panel.component.ts`
  - `dispense-medication-drawer.component.ts`
- Backend is not implemented; all service calls fall back to bundled mock data identical in shape
  to the proposed API responses, so swapping in the real backend later requires no caller changes.
