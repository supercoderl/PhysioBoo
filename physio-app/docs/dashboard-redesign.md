# Admin Overview Dashboard Redesign — Executive Dashboard

**Path:** `admin/overview/dashboard` (`src/app/pages/admin/overview/dashboard`)
**Source:** Claude Design project "Dashboard Redesign" (`Dashboard Redesign.dc.html`), imported via the `claude_design` MCP.
**Scope:** Full layout replacement of the admin dashboard body (sidebar/header/shell are unchanged — this redesign only replaces what renders inside the existing admin content area). Supersedes the earlier "visual polish" pass documented previously in this file: this is the "Full redesign" pass that pass explicitly deferred (live data via service, new information architecture, new API contract).

---

## 1. UX Audit — Previous State

The prior dashboard (KPI strip + appointment/statistics row + category quick-links + report/visit/doctor tables) was patient-record-centric and had no real-time operational signal: no live occupancy, no alerting, no OR/ward status, no shift/staffing view. For an HIS "executive" landing page, administrators need at-a-glance operational health (is anything critical right now?) before drilling into records — that was missing.

## 2. Information Architecture

```
Admin Overview Dashboard (/admin/overview/dashboard)
├── Status Strip (dark, sticky-feel band) — system status, ER/ICU/OR load, alert counts, staffing, revenue, shift/date
├── Page Title Row — title, subtitle, Refresh / Date / Export actions
├── Main Operational Grid (asymmetric 3-col)
│   ├── Patient Flow (KPI row + 24h admissions/discharges area chart)
│   ├── Department Load (per-department utilization bars)
│   ├── Alerts (spans 2 rows — collapsible Critical / Warning / Info groups)
│   ├── Bed Capacity (per-ward occupancy bars)
│   └── Active Operations (OR-by-OR progress)
├── Financial + Clinical Strip (5 panels) — Revenue, Insurance Claims, Pharmacy, Laboratory, Radiology
└── Bottom Row
    ├── Appointment Flow Timeline (hourly booking bar chart + footer stats)
    └── Right column: Staff on Duty (donut) + Recent Events (activity feed)
```

## 3. User Journey

Admin lands on the dashboard → status strip gives an instant operational read (is ER/ICU critical? any alerts?) → scans the main grid for patient flow trend, department load, and any alerts needing action → checks bed capacity and active operations for capacity planning → reviews financial/clinical mini-panels for revenue/claims/pharmacy/lab/radiology health → checks today's appointment flow and staffing before drilling into a specific module via the sidebar.

## 4. Layout & Wireframes

```
┌ Status Strip: ● Operational | ER 68% | ICU 92% CRIT | OR 3/5 | Alerts 2/4 | Staff 204/218 | Rev $52.4K | date/shift ┐
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Executive Dashboard                                              [Refresh] [Jul 5, 2026] [Export Report]          │
├───────────────────────────────────┬──────────────────┬─────────────────────────────────────────────────────────┤
│ Patient Flow (KPIs + area chart)  │ Dept Load (bars) │ Alerts (Critical/Warning/Info, collapsible)              │
│                                    ├──────────────────┤                                                           │
│                                    │ Active Operations│                                                           │
├────────────────────────────────────┴──────────────────┴─────────────────────────────────────────────────────────┤
│ Bed Capacity spans under Patient Flow column; Active Operations under Dept Load column (see grid spec below)     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Revenue │ Insurance Claims │ Pharmacy │ Laboratory │ Radiology                                                    │
├────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┤
│ Appointment Flow (hourly bars + footer stats)       │ Staff on Duty (donut) / Recent Events (feed)               │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Grid: `grid-template-columns: 4fr 2fr 2.5fr; grid-template-rows: auto auto;` — col 1 row 1 = Patient Flow, col 1 row 2 = Bed Capacity, col 2 row 1 = Dept Load, col 2 row 2 = Active Operations, col 3 spans both rows = Alerts.

## 5. Component Hierarchy

```
DashboardComponent (page)
├── AdminDashboardStatusStripComponent        — top dark operational strip
├── AdminPatientFlowCardComponent              — KPI row + SVG area/line chart
├── AdminDeptLoadCardComponent                 — department utilization bars
├── AdminAlertsCardComponent                   — critical/warning/info collapsible groups
├── AdminBedCapacityCardComponent               — ward occupancy bars
├── AdminActiveOperationsCardComponent          — OR progress cards
├── AdminFinancialClinicalStripComponent        — revenue/insurance/pharmacy/lab/radiology 5-panel row
├── AdminAppointmentFlowCardComponent           — hourly booking bar chart + stats
├── AdminStaffDutyCardComponent                 — staffing donut + breakdown
└── AdminRecentEventsCardComponent              — activity feed
```

All new components live in `src/app/components/layout/admin/dashboard/` alongside the existing KPI/table cards (which remain in the codebase, unused by this page, since they are still referenced by `revenue-kpi-strip.component.ts` / potentially future pages — not deleted). All components are `@Input()`-driven (no internal mock data), fed by `DashboardOverviewService` from the page component, matching the project's service/component split used elsewhere (e.g. `RevenueReportService` → `revenue-report` page).

Reused as-is: `boo-icon` (lucide icons), design tokens `bg-surface`, `border-borderGray`, `text-primary` (#012047), `secondary` (#0e82fd), `bg-body`, `bg-menu` — the source design's navy/blue/gray palette already matches these 1:1, so no new tokens are introduced.

## 6. UI Specification

- Card shell: `bg-surface border border-borderGray rounded-lg` (existing token pattern), no new shadow/radius scale introduced.
- Severity colors use Tailwind's default `emerald-500` / `amber-500` / `red-500` (`#10b981` / `#f59e0b` / `#ef4444`) which match the source design exactly — no new palette entries needed.
- Status strip uses `bg-primary` (navy) directly, matching the sidebar/brand navy already in use.
- Charts (area/line/donut) are inline SVG built from data via small pure helper functions on each component (no new chart library dependency — consistent with keeping bundle size flat; `ngx-charts` remains available for the KPI cards used elsewhere).

## 7. Interaction Design

- Alerts card: clicking a severity header toggles that group open/closed (local component state); "Respond"/"Dismiss" optimistically remove the alert from the local list; "Mark read" clears all group counts locally. No backend write in this pass (see API Contract — dismiss/ack endpoints are proposed but not required for the UI to function).
- "Refresh" button re-invokes `DashboardOverviewService.getOverview()`.
- "Export Report" is wired to a placeholder service method (`DashboardOverviewService.exportReport()`) that the page calls and surfaces a toast on completion — actual export generation is backend scope.
- All interactive elements keep `focus-visible:ring-2 focus-visible:ring-primary` per the app's existing pattern.

## 8. Responsive Behavior

- Status strip: `flex-wrap` with `row-gap`, already collapses to multiple rows on narrow viewports (kept from source design).
- Main operational grid: `grid-cols-[4fr_2fr_2.5fr]` on `xl:`, collapses to `xl:grid-cols-1` (stacked) below `xl`, since a 3-column asymmetric layout does not have a meaningful 2-column intermediate.
- Financial/clinical strip: `xl:grid-cols-5 md:grid-cols-3 grid-cols-2`.
- Bottom row: `xl:grid-cols-[3fr_2fr] grid-cols-1`.

## 9. Accessibility

- Severity is conveyed by icon/label text ("CRIT", "Warning", "Info") in addition to color, not color alone.
- Collapsible alert groups use a real `<button>` with `aria-expanded` bound to open state.
- All KPI numbers use `font-variant-numeric: tabular-nums` (kept from source) for stable-width scanning.
- Focus rings on every interactive control (buttons, collapsible headers).

## 10. Page States

- **Loading:** each card renders a skeleton (existing `animate-pulse` utility pattern) until `DashboardOverviewService.getOverview()` resolves.
- **Empty:** not expected for an operational snapshot; if `depts`/`wards`/`ops`/`events` arrays are empty, cards render an inline "No data" row rather than an empty gap.
- **Error:** if the request fails, the page shows an inline error banner above the grid with a "Retry" action (reuses the same Refresh handler); previously-loaded data (if any) is kept visible rather than cleared.
- **Success:** the target state described throughout this document.

## 11. Edge Cases

- Alert lists longer than the visible area scroll within the Alerts card (`overflow-y:auto`), card itself does not grow unbounded (`grid-row:span 2` keeps it aligned to the two rows beside it).
- Department/ward names that are long truncate with ellipsis; utilization percentage never gets clipped (fixed-width right-aligned).
- Zero active operations renders "No active operations" rather than an empty list.
- Clock/date/shift in the status strip is computed client-side every second — must clean up the interval in `ngOnDestroy` to avoid leaks when navigating away.

## 12. Performance Considerations

- SVG path generation is O(n) over small (≤24 point) datasets — negligible cost, recomputed only when input data changes (`@Input` setter / `ngOnChanges`), not on every change-detection tick.
- The 1-second clock tick only updates the status strip component's own state, not the whole page (isolated component + `OnPush` change detection).
- Single aggregated `getOverview()` call on load/refresh instead of 10 separate requests.

## 13. Scalability

- One aggregated snapshot endpoint keeps the page to a single round-trip; if individual widgets need independent refresh cadences later (e.g., alerts polling every 15s while the rest stays static), the API contract below already separates concerns by section so it can be split into per-section endpoints without a frontend rewrite — each card already takes its slice of the snapshot as its own `@Input`.
- New department/ward rows require no frontend change (rendered from the array the service returns).

## 14. Enterprise Recommendations

- Alerts should eventually support real acknowledgement/audit trail (who dismissed what, when) — the placeholder `dismissAlert`/`respondToAlert` methods on `DashboardOverviewService` are the seam where that would plug in.
- Consider WebSocket/SignalR push for the status strip and alerts once available, instead of polling, given their "live" framing — out of scope for this pass (HTTP GET + manual Refresh only).

---

## 15. API Contract (Proposed — not implemented on backend)

### `GET /api/dashboard/overview`

**Purpose:** Return a single aggregated operational snapshot for the executive dashboard.
**Method:** GET
**Request (query params):** `date?: string` (ISO date, defaults to today), `shift?: 'morning' | 'afternoon' | 'night'` (defaults to current)
**Response:** `PagedResponse<DashboardOverviewSnapshot>` where `DashboardOverviewSnapshot` = `{ status, patientFlow, departmentLoad, alerts, bedCapacity, activeOperations, financial, appointmentFlow, staffDuty, recentEvents }` (see `src/app/shared/types/dashboard-overview.types.ts` for exact field shapes).
**Frontend usage:** `DashboardOverviewService.getOverview(query)` — called on page init and on "Refresh" click; response is fanned out to each card component via `@Input`.

### `POST /api/dashboard/alerts/{alertId}/dismiss`

**Purpose:** Acknowledge/dismiss an alert.
**Method:** POST
**Request:** path param `alertId`, body `{ resolutionNote?: string }`
**Response:** `PagedResponse<{ success: boolean }>`
**Frontend usage:** `DashboardOverviewService.dismissAlert(alertId, note)` — called from the Alerts card's "Dismiss"/"Respond" actions; UI updates optimistically and rolls back on error.

### `POST /api/dashboard/export`

**Purpose:** Generate the exportable report backing the "Export Report" button.
**Method:** POST
**Request:** `{ date: string, shift?: string, format: 'pdf' | 'xlsx' }`
**Response:** `PagedResponse<{ fileUrl: string }>`
**Frontend usage:** `DashboardOverviewService.exportReport(request)` — called from the page's Export button handler, opens `fileUrl` on success.
