# Prescription Dispense — Redesign

Route: `/admin/pharmacy/prescription-dispense` · Component: `AdminPrescriptionDispenseComponent`
Backend: `physio-server/PhysioBoo.Presentation/Endpoints/DispensingEndpoints.cs` (`api/pharmacy/dispensing`).

## 1. UX Audit (old page)

Three equal-height columns (queue / picking / summary) inside a fixed `100vh - 220px` box.

| Area | Finding |
|---|---|
| Layout | Three narrow columns compete for width; the picking column carries patient context, alerts, every medicine, notes and scan input in one scroll. |
| Review vs. dispense | No separation: ticking a checkbox (a dispensing action) is the same gesture as reading a line. |
| Writes | Every action updated local state first and fired the request with an empty `subscribe()`. A rejected request (insufficient stock, unacknowledged Critical alert, closed session) left the UI showing a state the server never accepted. |
| Fake behaviour | "Print" toasted *labels sent to printer* with no printer call; "Cancel item" never called the API; "Inventory Changes" showed the line count; "Pharmacist" was a hard-coded string; the auto-refresh toggle did nothing; `dispensingStartedAt` fell back to `new Date()`. |
| Permissions | Route guard only checks `pharmacy:prescription:read`. The API requires `pharmacy:dispensing:read` for reads and `pharmacy:dispensing:process` for every mutation; the frontend had neither constant and never gated buttons. |
| Barcode | Matched against `batchNo` / `medicineId` client-side; the API verifies per line against barcode, QR code, drug code or batch number. |
| States | No loading state for the queue or workspace, no error state for the workspace, no feedback while a request is in flight (double submits possible). |

## 2. Current Problems (summary)

Optimistic writes without rollback · fabricated UI (print, cancel item, pharmacist, timer) · no permission gating · no loading / error states for the workspace · dense, undifferentiated picking cards · filter UI built from native inputs and ad-hoc pills.

## 3. Information Architecture

```
Page header ── title · live queue metrics (GET /stats) · refresh
├─ Queue pane (left)           search · status · issue date · active-filter chips · prescription list
└─ Workspace pane (right)
   ├─ Prescription header      Rx no · status · patient · prescriber · issued · stage stepper
   ├─ Patient safety strip     allergies · conditions · pregnancy / paediatric / high-risk · diagnosis
   ├─ Clinical alerts          grouped, severity ordered, acknowledge (process permission)
   ├─ Tabs: Review | Dispense
   │    Review   read-only medicine cards: dosage, instructions, quantity, stock, warnings, substitutes
   │    Dispense actionable cards: pick, quantity, batch, scan, reserve, replace, hold line
   └─ Dispense footer (sticky)  notes · Hold · Cancel · Complete dispensing
Medicine drawer                batches (FEFO), stock by location, interactions, history, substitutes
Dialogs                        reason (hold / cancel / hold line / replace), result summary
```

## 4. User Journey

1. Pharmacist opens the page → queue loads (priority, then issue order) with metrics.
2. Filters by patient / MRN / Rx number, status or issue date; selects a prescription.
3. **Review**: reads patient safety strip, acknowledges Critical alerts, checks each medicine's dose, frequency, duration, prescribed quantity and stock.
4. **Dispense**: per line — pick, adjust quantity, choose batch, scan to verify, reserve, replace, or hold the line.
5. **Complete dispensing** (confirm) → server deducts stock → result dialog (lines dispensed / remaining, stock movements, insurance vs patient amount, elapsed time, pharmacist) → queue + metrics refresh.
6. Alternatively **Hold** (reason, reservations kept) or **Cancel** (reason, releases reservations, cancels the prescription).

## 5. Layout

Desktop ≥1280: `grid-cols-[380px_minmax(0,1fr)]`, both panes scroll independently under the page header; workspace footer is sticky.
Tablet 768–1279: queue becomes a collapsible top section (list height-capped); workspace full width.
Mobile <768: queue and workspace are stacked; selecting a prescription scrolls the workspace into view; footer actions wrap to two rows.

## 6. Wireframes

```
┌ Prescription Dispense ───────────── Pending 4 · In progress 1 · Done today 7 · Avg 6 min  [⟳] ┐
├────────────────────┬──────────────────────────────────────────────────────────────────────────┤
│ [search…        ]  │ RX-2026-0042  [Preparing]  Normal      Dr. Tran · issued 24 Oct 09:12     │
│ [Status▾][Date ▾]  │ Nguyen Van A · F, 34y · MRN 0001   ⚠ Allergy: Penicillin   Pregnancy      │
│ (chips)            │ ●━━●━━○━━○ stage stepper                                                  │
│ ───────────────    │ ┌ Clinical alerts (2) ─────────────────────────────────────────────────┐ │
│ #1 RX-…  Waiting   │ │ Critical  Amoxicillin  Allergy match   [Acknowledge]                  │ │
│ Patient · MRN      │ └───────────────────────────────────────────────────────────────────────┘ │
│ Dr · 3 meds · date │ [ Review ] [ Dispense ]                                                   │
│ #2 …               │ ┌ Amoxicillin 500 mg · capsule · oral ───────────────────── [Not picked] ┐│
│                    │ │ 1 capsule · 3×/day · 7 days     Prescribed 21 caps                    ││
│                    │ │ Batch B-204 · exp 2027-03 · shelf A2 · 140 available                  ││
│                    │ └───────────────────────────────────────────────────────────────────────┘│
│                    ├──────────────────────────────────────────────────────────────────────────┤
│                    │ Notes […]            [Hold] [Cancel]            [Complete dispensing]     │
└────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

## 7. Component Hierarchy

```
AdminPrescriptionDispenseComponent        state, API orchestration, permissions, in-flight lock
├─ DispenseQueuePanelComponent            boo-search-field, boo-select, boo-datepicker, boo-filter-chips, list, skeleton / empty / error
├─ DispenseDetailPanelComponent           header, patient strip, alerts, tabs, medicine list, footer
│  ├─ DispenseProgressStepperComponent    (kept)
│  └─ DispenseMedicineCardComponent       one prescribed line, `review` | `dispense` mode
├─ DispenseMedicationDrawerComponent      drawer (reused app drawer)
├─ DispenseReasonDialogComponent          required reason, ≤500 chars
└─ DispenseResultDialogComponent          DispenseSummary after completion
```
Pure helpers (tones, labels, validation) live in `shared/utils/dispensing.utils.ts`.

## 8. UI Specification

* Shared: `boo-button` (variant design system), `boo-search-field`, `boo-filter-chips`, `boo-status-badge`, `boo-empty-state`, `boo-error-state`, `boo-inline-error`, `boo-input`, app `boo-select`, `boo-datepicker`, `boo-textarea`, `drawer`, `DialogService.confirm`, `ToastService`.
* Tone mapping — prescription: Waiting neutral · Verifying/Preparing/Dispensing primary · OnHold warning · Completed success · Cancelled danger. Priority: Critical/High danger, Normal neutral. Alert severity: Critical/High danger, Medium warning, otherwise neutral.
* Only fields returned by the API are shown; absent optional values are omitted rather than replaced with placeholders.

## 9. Interaction Design

* Search is debounced (350 ms) and server-side; status is server-side; issue date is client-side on `createdAt` (the API has no date filter).
* Every mutation: lock → request → reload the workspace (server is authoritative) → refresh queue / metrics when the prescription status changed. No optimistic writes. Errors surface the API message (toast) and leave the UI unchanged.
* Quantity commits after a typing pause, validated `0 ≤ qty ≤ prescribed` client-side; the server enforces the remaining quantity.
* Complete is confirmed; hold prescription, cancel prescription and substitute open a reason dialog (the API requires a 1–500 character reason). Holding a single line is reversible (*Resume line*) and needs no reason.
* Keyboard: queue rows are buttons (Tab / Enter); `Esc` closes drawer and dialogs; `Ctrl+B` focuses the scan field of the first actionable line.

## 10. Responsive Behaviour

See §5. Touch targets ≥ 40 px (design-system button `sm`). Medicine card metadata wraps; actions wrap under the line on narrow widths.

## 11. Accessibility

Landmarks (`main`, `aside` labelled regions), tabs with `role="tablist"/"tab"/"tabpanel"` and `aria-selected`, status never colour-only (text badge), `role="alert"` on Critical alerts and error states, live region for in-flight status, focus returns to the originating control when drawer / dialog close, form errors tied by text. Colours use design tokens meeting WCAG AA on white.

## 12. Page States

| State | Behaviour |
|---|---|
| Queue loading | Skeleton rows |
| Queue empty | Empty state (different copy when filters are active, with *Clear filters*) |
| Queue error | `boo-error-state` with retry (permission-specific copy on 403) |
| No read permission | Page-level no-access state (no requests sent) |
| No selection | Workspace empty state |
| Workspace loading | Skeleton |
| Workspace error | `boo-inline-error` with retry |
| Read-only (no process permission, or Completed / Cancelled) | Review tab only, actions hidden, explanatory banner |
| Mutating | Controls disabled, spinner on the acting button, `aria-busy` |

## 13. Edge Cases

Prescription disappears from the queue after refresh (selection cleared) · closed session (`Completed`/`Cancelled`) → read-only · insufficient stock or unusable batch → API message toasted, line unchanged, soft warning when `qtyToDispense` exceeds the selected batch's availability · Critical alert unacknowledged → pick and complete blocked (mirrors API) · substitution not allowed / not offered → API message · partially dispensed prescription shows remaining quantity as the dispense quantity (API value) · no batch → shelf / batch omitted and a "No batch selected" note shown · held prescription: any line action resumes it (API behaviour; there is no separate resume endpoint).

## 14. Performance

Single list request (API returns the full queue unpaged), rendered with `trackBy`; workspace and medicine detail fetched on demand; medicine detail cached per medicine id for the page lifetime; search debounced; signal-based state; request cancellation via `switchMap` for queue and workspace loads.

## 15. Scalability

If the queue grows large, the API needs paging (see §17) — the panel already consumes `PagedResult` and can adopt `boo-pagination` without layout change. Components take plain inputs/outputs so a future "pharmacy station" view can reuse the medicine card.

## 16. Enterprise Recommendations

Server-side date filter · line-level dispensed quantity in the workspace DTO (today only the line status is available) · label printing endpoint · audit trail endpoint for a prescription's dispensing events · real-time queue push (SignalR) instead of manual refresh · `pharmacy:dispensing:*` in the route guard (see §17).

## 17. API Contract (existing endpoints used — nothing new proposed for this page)

All under `/api/pharmacy/dispensing`, responses wrapped as `{ success, data }`.

| Purpose | Method · URL | Request | Response | Permission | Frontend usage |
|---|---|---|---|---|---|
| Queue | GET `/queue` | `search?`, `status?` | `PagedResult<DispenseQueueItem>` | `pharmacy:dispensing:read` | list, filters |
| Metrics | GET `/stats` | – | `{ pendingCount, inProgressCount, completedTodayCount, averageDispensingMinutes }` | read | header metrics |
| Workspace | GET `/queue/{id}/workspace` | – | `DispenseWorkspace` (404 → null) | read | detail panel |
| Batches | GET `/medicines/{id}/batches` | – | `BatchOption[]` | read | (already embedded per line) |
| Medicine detail | GET `/medicines/{id}/detail` | – | `DispenseMedicineDetail` | read | drawer |
| Acknowledge alert | POST `/workspace/{id}/alerts/{alertId}/acknowledge` | `{ note? }` | `{ alertId }` | `…:process` | alerts |
| Update line | PATCH `/workspace/{id}/items/{itemId}` | `{ qtyToDispense?, status?, batchNo? }` status ∈ NotPicked, Picked, OnHold | line | process | pick / qty / batch / hold line |
| Scan | POST `…/items/{itemId}/scan` | `{ barcode }` | `{ matched }` | process | verify line |
| Reserve | POST `…/items/{itemId}/reserve` | `{ note? }` | line | process | reserve stock |
| Replace | POST `…/items/{itemId}/replace` | `{ alternativeMedicineId, reason }` | line | process | substitute |
| Hold | POST `/workspace/{id}/hold` | `{ reason }` | `{ workspaceId }` | process | footer |
| Cancel | POST `/workspace/{id}/cancel` | `{ reason }` | `{ workspaceId }` | process | footer |
| Complete | POST `/workspace/{id}/complete` | `{ pharmacistNotes? }` | `DispenseSummary` (400 on insufficient stock / unpicked lines / unacknowledged Critical) | process | footer |

### Known limitations

* The workspace DTO has no already-dispensed quantity per line; progress is shown per line status.
* No label-printing endpoint → no print action is offered.
* The queue is unpaged and has no date filter (issue-date filter is client-side).
* The route guard (`pharmacy:prescription:read`) differs from the API's `pharmacy:dispensing:read`; the page checks the API permissions itself.
