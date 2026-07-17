# Laboratory Module Redesign — Enterprise Laboratory Information System (LIS)

**Path:** `admin/paraclinical/laboratory`
**Current implementation:** `src/app/pages/admin/paraclinical/laboratory/laboratory.component.ts` — a single demo component with an always-empty mock array (`initializeSampleData()` never populates anything), `ngModel`-bound filters, a table whose every cell binds to `test.testName` regardless of column, and action handlers that call `alert()`/`confirm()`. No service, no models beyond the unrelated `LabTest` (test catalog) type, no workflow beyond a static list.
**Scope:** Frontend UI/UX only. No backend implementation — see §13 for the proposed API contract. Reuses the conventions already established by the Treatment Sheet module (`docs/treatment-sheet-redesign.md`) and the Medical Record / Nursing modules: standalone components, Angular signals, `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIcon`, `BooSelect`, `BooInput`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, mock-fallback services.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Data model | Binds the table to `LabTest` (the test **catalog** entity used by Settings → Lab Test admin) | Confuses "what tests exist" with "what was ordered for a patient" — there is no order/sample/result model at all |
| Sample data | `initializeSampleData()` assigns `this.labTests = []` | The page is permanently empty; nothing can ever be demoed |
| Table cells | Every column (`Patient Info`, `Test Type`, `Date`, `Priority`, `Status`, `Ordered By`) binds to `test.testName` | Visually broken even if data existed — no real patient, priority, or status fields exist on `LabTest` |
| Actions | `viewTest`/`editTest`/`openAddTestModal` call `alert(...)`; `deleteTest` calls `confirm(...)` | No real navigation, no drawer, no confirmation dialog, not accessible, blocks the UI thread |
| Workflow | None — a single flat list | No concept of order → sample collection → tracking → processing → result entry → verification → release, which is the entire point of a LIS |
| Sample lifecycle | Not modeled | No barcode, no container/sample type, no collection/received/processing timestamps |
| Critical values | Not modeled | No panic-value or critical-result alerting, which is a patient-safety requirement in a real LIS |
| Verification | Not modeled | No technician/pathologist sign-off step; results would "complete" with no review |
| Dashboard | 4 static `<svg>` cards wired to a meaningless `getTestsByStatus(status)` filter (filters on `sampleType`, not status) | No real KPIs (TAT, pending verification, critical count) and the filter logic is wrong even for the demo data shape |
| Filters | Search + 2 selects, client-side only, `ngModel` | No department/ward/MRN/visit/category/sample-type/technician/date-range filtering, no saved/quick filters |
| Loading/empty/error states | None | No skeletons, no real empty state, no error/retry |
| Accessibility | Native `alert()`/`confirm()`, no ARIA roles on tabs (no tabs exist) | Screen readers and keyboard users get blocking dialogs with no programmatic context |
| Responsiveness | Single fixed breakpoint (`md`) | No tablet/mobile-specific behavior for a workspace that lab staff use on shared terminals and tablets |

**Root cause:** the page was built as a flat demo bound to the wrong model (test catalog instead of test orders) with no data layer — it predates the Treatment Sheet / Nursing / Medical Record enterprise patterns already established elsewhere in this codebase, and never modeled the actual laboratory workflow.

---

## 2. Information Architecture

```
Laboratory (/admin/paraclinical/laboratory)
├── Sticky Module Header
│   (Title, global search, date-range picker, "New Order" action — quick links to Settings → Lab Test catalog)
├── Dashboard Statistics Strip (Total Orders, Pending Collection, Collected, In Processing,
│    Pending Verification, Completed, Critical Results, Avg TAT)
├── Critical Result Alerts Banner (Panic Value / Critical / Delta Check / Out-of-Range —
│    severity-sorted, acknowledgeable, dismissible when empty)
├── Filter & Quick-Filter Bar (Department, Ward, Patient/MRN/Visit/Order#, Category, Test Type,
│    Priority, Status, Sample Type, Technician, Date Range, Saved Filters)
├── Tab: Dashboard       (KPI cards + trend charts: daily orders, TAT, pending samples, categories,
│                          critical rate, technician workload)
├── Tab: Orders          (enterprise data table — search/filter/sort/pagination/bulk/grouping)
├── Sample Collection &  (barcode, container, collector, collection status, recollect/reject;
│    Tracking               timeline per sample: Ordered → Collected → Received → Processing →
│                            Quality Check → Completed → Verified → Report Released)
├── Tab: Result Entry &  (structured numeric/text result entry with reference range, unit,
│    Verification           flagging, comments, attachments; verifying technician/pathologist,
│                            approve/reject/return-for-review)
└── Tab: Critical Alerts (full list of panic/critical/delta-check/out-of-range alerts with
                           severity, suggested action, acknowledgement status)

Drawer: Patient Result Drawer (opened from any tab's row "View")
  — Patient Summary, Laboratory History, Current Orders, Previous Results, Trend mini-chart,
    Attachments, Quick Actions (View EMR, Print Report, Export PDF)
```

**Key IA decision:** unlike Treatment Sheet (patient-centric, one workspace per admission), Laboratory is **order-centric** — a department-wide workspace listing every order across all patients, matching how lab staff actually work (a queue of work, not one patient at a time). Drilling into a specific patient's result history happens through the **Patient Result Drawer**, not a page navigation, so technicians never lose their place in the queue. This mirrors how the existing Medical Record / Treatment Sheet laboratory tabs already show a *single patient's* lab rows — this module is the inverse: the department's view across all patients, and is the system of record those per-patient tabs would eventually read from.

---

## 3. User Journey

1. A lab technician, pathologist, or front-desk staff opens **Laboratory** from the sidebar.
2. The stats strip and critical alerts banner give an instant read on backlog and patient-safety issues before any action is taken.
3. **Order Entry context:** a doctor's order arrives in the **Orders** tab as `Ordered` / collection-pending. Staff use Filters (department, priority, status, date range) or Quick Filters ("My Pending", "STAT Only", "Unverified") to find their queue.
4. **Sample Collection:** the technician scans/enters a barcode, selects sample/container type, and marks the sample `Collected`. Recollect/Reject actions handle bad draws.
5. **Tracking:** as the sample moves through Received → Processing → Quality Check, the timeline updates with timestamps; staff can see where any sample is stuck.
6. **Result Entry:** once processing completes, the technician enters numeric/text results inline against the reference range/unit; out-of-range values auto-flag (H/L/HH/LL) and critical/panic values raise an alert immediately.
7. **Verification:** a senior technician or pathologist reviews flagged/critical results in **Result Entry & Verification**, and Approves, Rejects, or Returns for Review. Approval timestamps the verifying technician/pathologist.
8. **Critical Alerts:** any panic/critical/delta-check/out-of-range result appears in the banner and the Critical Alerts tab until acknowledged, each with severity and a suggested action (e.g., "Notify ordering physician immediately").
9. **Release & Reporting:** once verified, the report is released; staff can open the **Patient Result Drawer** to view trend history, print the report, export PDF, or jump to the patient's EMR.
10. Dashboard charts (daily orders, TAT, pending samples, category mix, critical rate, technician workload) let lab management spot bottlenecks without leaving the page.

---

## 4. Layout & Wireframes

### 4.1 Sticky Module Header
`position: sticky; top: 0`. Left: title "Laboratory", subtitle "Laboratory Information System". Right: global search (order #/patient/MRN), date-range selector, "New Order" button (routes to order-creation — placeholder action until a clinical ordering flow exists elsewhere), and a link to Settings → Lab Test catalog for context.

### 4.2 Critical Result Alerts Banner
Same visual treatment as Treatment Sheet's Clinical Alerts banner: horizontally scrollable chips, severity-sorted (Panic → Critical → Delta Check → Out-of-Range), each with icon, message, patient/order reference, raised time, Acknowledge action. Hidden entirely when zero active alerts.

### 4.3 Dashboard Statistics Strip
8 `StatCardComponent` tiles: Total Orders, Pending Collection, Collected Samples, In Processing, Pending Verification, Completed Tests, Critical Results (danger tone), Avg TAT (hours). Wraps to 4 columns on tablet, 2 on mobile.

### 4.4 Filter & Quick-Filter Bar
Row of `BooSelect`/`BooInput` controls: Department, Ward, Patient/MRN/Visit/Order #, Laboratory Category, Test Type, Priority, Status, Sample Type, Technician, Date Range. A secondary row of toggle chips for Quick Filters ("My Pending", "STAT Only", "Unverified", "Critical Only") plus a Saved Filters dropdown (`SavedView`-style, same shape as `boo-table-admin`'s saved views).

### 4.5 Tab Bar
Same visual treatment as `AdminTreatmentSheetComponent`: icon + label + optional count badge, `role="tablist"`, bottom-border active indicator, horizontally scrollable on narrow viewports. Tabs: Dashboard, Orders, Sample Collection & Tracking, Result Entry & Verification, Critical Alerts.

### 4.6 Tab Content
- **Dashboard:** KPI recap (reuses the stats strip data) + 6 lightweight CSS-rendered trend visualizations (no new chart dependency, consistent with "no npm install" build rule): Daily Orders (bar), Turnaround Time trend (bar), Pending Samples by stage (horizontal bar), Test Categories mix (horizontal bar/legend), Critical Result Rate (donut via conic-gradient), Technician Workload (horizontal bar leaderboard).
- **Orders:** table — Order #, Patient, MRN, Department, Ward, Ordered Tests, Ordering Doctor, Priority (badge), Collection Status (badge), Lab Status (badge), Verification Status (badge), Order Time. Search, filter, sort, pagination, bulk selection (e.g., bulk print barcode, bulk mark collected), grouping by Department/Priority/Status. Row action → opens Patient Result Drawer.
- **Sample Collection & Tracking:** card/list per sample — Barcode, Sample Type, Container Type, Collection Time, Collector, Collection Status; actions: Print Barcode, Recollect, Reject. Selecting a sample expands its tracking Timeline (Ordered → Collected → Received → Processing → Quality Check → Completed → Verified → Report Released) with a timestamp per stage.
- **Result Entry & Verification:** table of in-process/completed orders — Test, Result Value (inline editable numeric/text input), Reference Range, Unit, Flag (badge: H/L/HH/LL/N), Comments, Attachments, Verifying Technician, Verifying Pathologist, Verification Status (badge); row actions: Approve, Reject, Return for Review (routes through `DialogService.confirm()`).
- **Critical Alerts:** full table — Severity (badge), Type (Panic/Critical/Delta Check/Out-of-Range), Description, Patient/Order reference, Suggested Action, Acknowledgement Status, Raised At; Acknowledge action.

### 4.7 Patient Result Drawer
Opened via `DrawerComponent` (width 720px), reused exactly as `lab-test-drawer.component.ts` does. Sections: Patient Summary (name, MRN, visit, department/ward), Laboratory History (chronological order list), Current Orders, Previous Results (table with abnormal-flag highlighting, mirroring `LabResultRow` from the Medical Record laboratory tab), a trend mini-chart per repeatable test (CSS sparkline), Attachments list. Quick Actions: View EMR (routes to Medical Record), Print Report, Export PDF.

---

## 5. Component Hierarchy

```
paraclinical/laboratory/
├── laboratory.component.ts                       (AdminLaboratoryComponent — shell: header, alerts
│                                                    banner, stats strip, filter bar, tabs)
└── tabs/
    ├── laboratory-dashboard-tab.component.ts
    ├── laboratory-orders-tab.component.ts
    ├── laboratory-sample-tracking-tab.component.ts
    ├── laboratory-result-verification-tab.component.ts
    └── laboratory-critical-alerts-tab.component.ts

paraclinical/laboratory/
└── patient-result-drawer.component.ts             (shared across tabs — opened by row "View";
                                                      kept page-local like Treatment Sheet's tabs,
                                                      not under components/layout/admin)

shared/types/laboratory.ts        (LabOrderRow, LabOrderTest, LabSample, LabResultEntry,
                                    LabCriticalAlert, LabStats, LabDashboardTrend, LabFilter,
                                    LabPatientResultSummary, enums: LabOrderStatus, SampleCollectionStatus,
                                    LabVerificationStatus, LabPriority, LabAlertType, LabAlertSeverity,
                                    LabResultFlag)
services/admin/laboratory.service.ts        (LaboratoryService — mock-fallback pattern, same as
                                              TreatmentSheetService)
```

**Reused without modification:** `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `BooTextareaComponent`, `BooCheckboxComponent`, `LocalLoadingService`, `ToastService`, `DialogService`. `LabTest` / `LabTestCategory` (catalog types) remain untouched and are only referenced for test-name/category lookups when building an order's test list.

**New (this feature):** everything under `paraclinical/laboratory/` above, the drawer component, `laboratory.ts` types, and `laboratory.service.ts`.

**Not duplicated:** the existing `LabResultRow`/`LabReportRow` types in `shared/types/medical-record.ts` (used by the Medical Record laboratory tab) and `TreatmentLabOrderRow` in `shared/types/treatment-sheet.ts` (used by the Treatment Sheet laboratory tab) keep modeling a *single patient's* view. This module's `LabOrderRow`/`LabResultEntry` model the *department's* operational view (the LIS side). If a canonical lab-result source of truth is introduced server-side, all three should read from it without changing their respective view models — same recommendation already made for MAR data in the Treatment Sheet doc.

---

## 6. UI Specification & Interaction Design

- **Alert severity → tone:** Panic → danger, Critical → danger, Delta Check → warning, Out-of-Range → warning.
- **Order priority → tone:** Stat → danger, Urgent → warning, Routine → neutral.
- **Collection status → tone:** Collected/Received → success, NotCollected → neutral, InTransit → primary, Rejected → danger.
- **Lab/processing status → tone:** Completed → success, Processing/QualityCheck → primary, Pending/Ordered → neutral, Cancelled → danger.
- **Verification status → tone:** Verified/Approved → success, PendingVerification → warning, Rejected/ReturnedForReview → danger.
- **Result flag → tone:** N → neutral, H/L → warning, HH/LL → danger.
- **Verification actions:** Approve is single-click (optimistic update + toast). Reject and Return for Review route through `DialogService.confirm()` requiring a reason, mirroring the Treatment Sheet MAR "Mark Missed" pattern.
- **Optimistic UI:** acknowledging a critical alert, marking a sample collected/rejected, and approving/rejecting a result update local signal state immediately; a service error reverts and shows a toast.
- **Keyboard:** tab bar is arrow/Enter navigable; table rows and barcode/result inputs are fully tabbable; all quick actions reachable via Tab.
- **Bulk actions (Orders tab):** "Print Barcode" and "Mark Collected" operate over the current selection via `boo-table-admin`'s existing `bulkActions` contract.
- **Inline result editing:** clicking a result cell swaps it for a `BooInput` (numeric or text per test definition); blur/Enter commits and re-evaluates the flag client-side against the reference range before the save call resolves.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full multi-panel workspace: sticky header + alerts + stats strip + filter bar + horizontal tabs + full-width tables/dashboard grid |
| Tablet (768–1279px) | Stats strip wraps to 4×2; filter bar collapses extra filters behind a "More Filters" popover; tables scroll horizontally; tab bar remains horizontal |
| Mobile (<768px) | Stats strip collapses to 2 columns; Orders/Sample/Result/Alerts tables become stacked cards (one card per order/sample/result/alert); Dashboard charts stack to single column; tab bar becomes a horizontally scrollable strip |

---

## 8. Accessibility (WCAG 2.1 AA)

- All status/priority/severity/flag badges pair color with text — never color alone.
- Critical Alerts banner lives in an `aria-live="polite"` region so new critical alerts are announced.
- "Reject" / "Return for Review" confirmations trap focus until resolved (reuses `DialogComponent`'s existing focus trap).
- Tab buttons use `role="tab"` / `aria-selected`, reachable and operable via keyboard only, with visible focus rings.
- Minimum 44×44px touch targets for all quick-action, bulk-action, and verification buttons on tablet/mobile.
- Inline result-entry inputs have associated `<label>`/`aria-label` referencing the test name and unit so screen readers announce "CBC — Hemoglobin, grams per deciliter" rather than a bare textbox.

---

## 9. Page States

- **Loading (initial):** centered spinner + label while the header/stats/alerts payload loads, matching Treatment Sheet's loading treatment.
- **Empty:** each tab shows `EmptyStateComponent` ("No orders match these filters", "No samples pending collection", etc.) only after a successful load with zero results.
- **Error:** inline red banner with Retry button at the section level — never a blocking full-page error.
- **Success:** standard populated view.
- **Disabled:** action buttons disable + show inline spinner while their specific `LocalLoadingService` key is in flight; never a global page lock. Result-entry inputs disable while their save request is in flight.

---

## 10. Edge Cases & Exception Handling

- A sample is rejected after collection → status moves to `Rejected`, a recollection order is implied (toast prompts staff to use "Recollect"), and the original row is visually de-emphasized but stays in history.
- A critical/panic result arrives while the page is open → surfaces only through the Critical Alerts banner once the alerts endpoint reports it; no intrusive modal (avoids alert fatigue, consistent with Treatment Sheet's handling).
- Two technicians submit a result for the same order/test simultaneously → second submit fails gracefully with an "already updated by {user}" toast (client-side error path; real conflict resolution is a backend concern).
- A result is entered outside the reference range but verification is rejected → the order returns to `PendingVerification` with the rejection reason visible to the entering technician (no silent loss of the entered value).
- No orders match the active filter combination → empty state offers a one-click "Clear Filters" action rather than a dead end.
- Equipment-failure notification (from the Notifications list, §"Notifications" in the brief) surfaces as a Warning-severity entry in the same Critical Alerts banner rather than a separate, competing notification surface.

---

## 11. Performance Considerations

- Header/stats/alerts load via a single `forkJoin` on entry (mirrors `AdminTreatmentSheetComponent.load`); each tab's own data loads lazily on first activation via `ngOnChanges`, not as one giant payload.
- Orders/Sample/Result/Alerts tables use `trackBy` (`id`) to avoid full re-renders on optimistic updates.
- All list-returning endpoints are designed against the existing `PaginationData<T>` contract so server-side pagination works without a type change once the backend lands; client-side filtering is a stopgap over the mock data only.
- Dashboard trend visualizations are pure CSS (no charting library), keeping the module dependency-free and avoiding the "no npm install" build constraint.

---

## 12. Scalability & Enterprise Recommendations

- Keep `LaboratoryService` on the same mock-fallback pattern as `TreatmentSheetService` so backend cutover requires zero caller changes.
- Model `LabOrderRow`, `LabSample`, `LabResultEntry`, and `LabCriticalAlert` as first-class types now (not `any`) so downstream features (billing triggers, CDS rules, accreditation reporting) can be layered in without a type rewrite.
- Keep the order-centric Laboratory module's types separate from the patient-centric `LabResultRow` (Medical Record) and `TreatmentLabOrderRow` (Treatment Sheet) view models — each serves a different workflow lens over what should eventually be the same backend facts.
- Sample barcode handling is modeled as a plain string field now (`barcode: string`) so a real scanner integration (keyboard-wedge or camera-based) can be wired in later without a type or component-contract change — the input is already a normal text field that any scanner can type into.
- Quick Filters and Saved Filters are modeled as plain client-side state for now (per the mock-fallback approach); the API contract already includes a saved-filter endpoint (§13) so persistence can be added without a UI rewrite.

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping via existing auth middleware (not repeated per row). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Get dashboard stats | GET | `/api/laboratory/stats?from=&to=` | query params | `LabStats` | Stats strip |
| 2 | Get dashboard trends | GET | `/api/laboratory/trends?from=&to=` | query params | `LabDashboardTrend` | Dashboard tab charts |
| 3 | Get active critical alerts | GET | `/api/laboratory/alerts` | — | `LabCriticalAlert[]` | Alerts banner + Critical Alerts tab |
| 4 | Acknowledge an alert | POST | `/api/laboratory/alerts/{alertId}/acknowledge` | `{ note?: string }` | `string` (id) | Alert chip/row dismiss |
| 5 | Search laboratory orders | GET | `/api/laboratory/orders/search` | `PagedRequest<LabOrderFilter>` | `PaginationData<LabOrderRow>` | Orders tab |
| 6 | Get order detail | GET | `/api/laboratory/orders/{orderId}` | — | `LabOrderRow` | Patient Result Drawer / row expand |
| 7 | Bulk update order status | PATCH | `/api/laboratory/orders/bulk-status` | `{ orderIds: string[], status: LabOrderStatus }` | `string[]` (updated ids) | Orders tab bulk action |
| 8 | Search samples | GET | `/api/laboratory/samples/search` | `PagedRequest<LabSampleFilter>` | `PaginationData<LabSample>` | Sample Collection & Tracking tab |
| 9 | Mark sample collected | PATCH | `/api/laboratory/samples/{sampleId}/collect` | `{ collectorName: string, containerType: string }` | `LabSample` | Sample Collection action |
| 10 | Recollect sample | POST | `/api/laboratory/samples/{sampleId}/recollect` | `{ reason: string }` | `LabSample` (new sample) | Sample Collection action |
| 11 | Reject sample | POST | `/api/laboratory/samples/{sampleId}/reject` | `{ reason: string }` | `LabSample` | Sample Collection action |
| 12 | Get sample tracking timeline | GET | `/api/laboratory/samples/{sampleId}/timeline` | — | `LabSampleTimelineEvent[]` | Sample Tracking expand panel |
| 13 | Print barcode | GET | `/api/laboratory/samples/{sampleId}/barcode` | — | binary (`application/pdf` or image) | "Print Barcode" action |
| 14 | Search result entries pending entry/verification | GET | `/api/laboratory/results/search` | `PagedRequest<LabResultFilter>` | `PaginationData<LabResultEntry>` | Result Entry & Verification tab |
| 15 | Submit/update a result value | PATCH | `/api/laboratory/results/{resultId}` | `{ value: string, comments?: string }` | `LabResultEntry` | Inline result editing |
| 16 | Verify (approve) a result | POST | `/api/laboratory/results/{resultId}/approve` | `{ verifierId: string }` | `LabResultEntry` | "Approve" action |
| 17 | Reject a result | POST | `/api/laboratory/results/{resultId}/reject` | `{ reason: string }` | `LabResultEntry` | "Reject" action |
| 18 | Return a result for review | POST | `/api/laboratory/results/{resultId}/return-for-review` | `{ reason: string }` | `LabResultEntry` | "Return for Review" action |
| 19 | Get patient laboratory summary (drawer) | GET | `/api/laboratory/patients/{patientId}/summary` | — | `LabPatientResultSummary` | Patient Result Drawer |
| 20 | Get patient laboratory history (drawer) | GET | `/api/laboratory/patients/{patientId}/history` | paged query | `PaginationData<LabOrderRow>` | Patient Result Drawer history list |
| 21 | Export a report as PDF | GET | `/api/laboratory/orders/{orderId}/export` | — | binary (`application/pdf`) | "Print Report" / "Export PDF" quick action |
| 22 | List saved filters | GET | `/api/laboratory/saved-filters` | — | `SavedView[]` | Filter bar "Saved Filters" |
| 23 | Save a new filter view | POST | `/api/laboratory/saved-filters` | `{ name: string, filter: LabOrderFilter }` | `SavedView` | Filter bar "Save current filter" |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/laboratory-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/laboratory.ts`
- [x] Service: `src/app/services/admin/laboratory.service.ts` (mock-fallback)
- [x] `LABORATORY` block in `src/app/shared/api/base.ts`
- [x] Route kept at `/admin/paraclinical/laboratory`
- [x] Components: shell + 5 tabs (Dashboard, Orders, Sample Collection & Tracking, Result Entry & Verification, Critical Alerts) + Patient Result Drawer
