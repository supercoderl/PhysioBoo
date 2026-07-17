# Radiology Module Redesign — Enterprise Radiology Information System (RIS)

**Path:** `admin/paraclinical/radiology`
**Current implementation:** `src/app/pages/admin/paraclinical/radiology/radiology.component.ts` — a single demo component. `initializeSampleData()` hardcodes 7 `RadiologyExam` rows directly on the component, filtering is `ngModel`-bound and client-side only, and every action (`openScheduleExamModal`, `viewImages`, `viewReport`, `editExam`, `deleteExam`) calls `alert()`/`confirm()`. No service, no workflow stages beyond a flat `status` string, no scheduling, no examination queue, no structured reporting/verification, no critical-findings alerting, no PACS placeholder.
**Scope:** Frontend UI/UX only. No backend implementation — see §13 for the proposed API contract. Reuses the conventions already established by the Laboratory module (`docs/laboratory-redesign.md`) and Treatment Sheet / Medical Record: standalone components, Angular signals, `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIcon`, `BooSelect`, `BooInput`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, mock-fallback services.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Data model | Single flat `RadiologyExam` with a bare `status` string (`scheduled/in-progress/completed/cancelled/reported`) | No concept of order vs. schedule vs. queue vs. report as separate lifecycle stages — a real RIS tracks all four independently |
| Sample data | `initializeSampleData()` hardcodes 7 rows on the component itself | Page can never reflect real data; no service layer to swap in a backend later |
| Workflow | None — exams jump straight from "scheduled" to "reported" | No scheduling step, no patient-arrival/queue step, no image-upload step, no separate report-verification step |
| Critical findings | Not modeled | No panic/urgent/incidental/follow-up alerting, a patient-safety requirement in any real RIS |
| Reporting | A single optional `report?: string` field | No structured Clinical Indication / Technique / Findings / Impression / Recommendations, no templates, no verification sign-off |
| PACS / images | `viewImages()` calls `alert()` | No placeholder area acknowledging where a PACS viewer would integrate; DICOM identifiers aren't modeled at all |
| Actions | `editExam`/`deleteExam` call `alert()`/`confirm()` | No real navigation, no drawer, no confirmation dialog, not accessible, blocks the UI thread |
| Dashboard | 5 static `<svg>` cards wired to `getExamsByStatus()` | No real KPIs (TAT, pending verification, critical count), no trend charts |
| Filters | Search + 3 selects/date, client-side only, `ngModel` | No department/ward/MRN/visit/order-number/radiologist/technician filtering, no saved/quick filters |
| Loading/empty/error states | None | No skeletons, no real empty state, no error/retry |
| Accessibility | Native `alert()`/`confirm()`, no ARIA roles on tabs (no tabs exist) | Screen readers and keyboard users get blocking dialogs with no programmatic context |
| Responsiveness | Single fixed breakpoint (`md`/`lg`) | No tablet/mobile-specific behavior for a workspace technologists and radiologists use on shared terminals and tablets |

**Root cause:** the page was built as a flat demo with a single status field and no data layer — it predates the Laboratory / Treatment Sheet enterprise patterns already established elsewhere in this codebase, and never modeled the actual radiology workflow (order → schedule → queue → image → report → verify → release).

---

## 2. Information Architecture

```
Radiology (/admin/paraclinical/radiology)
├── Sticky Module Header
│   (Title, global search, "New Order" action)
├── Critical Findings Alerts Banner (Critical / Urgent / Incidental / Follow-up Required —
│    severity-sorted, acknowledgeable, dismissible when empty)
├── Dashboard Statistics Strip (Total Orders, Waiting for Scheduling, Scheduled, In Progress,
│    Pending Reporting, Pending Verification, Completed, Critical Findings, Avg TAT)
├── Tab: Dashboard            (KPI cards + trend visualizations: imaging volume, TAT, modality
│                               utilization, pending reports, critical findings, radiologist
│                               workload, equipment utilization)
├── Tab: Imaging Orders       (enterprise data table — search/filter/sort/pagination/bulk)
├── Tab: Scheduling           (room/modality/technician/time-slot list — reschedule, cancel,
│                               reassign, drag & drop reordering)
├── Tab: Examination Queue    (Waiting / Called / In Progress / Completed / Cancelled columns,
│                               prioritization)
├── Tab: Study Tracking &     (per-study timeline: Ordered → Scheduled → Arrived → Imaging
│        Image Review            Started → Imaging Completed → Image Uploaded → Reporting →
│                                 Verified → Released; study info + PACS viewer placeholder)
├── Tab: Radiologist          (structured report editor: Clinical Indication, Technique,
│        Reporting &             Findings, Impression, Recommendations, Attachments, Templates,
│        Verification            Favorites, Voice Dictation placeholder, Auto-Save; verification
│                                 table: reporting/verifying radiologist, Approve/Reject/Return)
└── Tab: Critical Findings    (full alert table — severity, description, acknowledgement,
                                notification status)

Drawer: Patient Study Drawer (opened from any tab's row "View")
  — Patient Summary, Imaging History, Previous Reports, Previous/Comparison Studies,
    Related Laboratory Results, Clinical Notes, Quick Actions (View EMR, Open PACS [placeholder],
    Print Report, Export PDF)
```

**Key IA decision:** like Laboratory, Radiology is **order-centric** — a department-wide workspace listing every imaging order/study across all patients, matching how technologists and radiologists actually work (a queue of work, not one patient at a time). Drilling into a specific patient's imaging history happens through the **Patient Study Drawer**, not a page navigation. This module is the department's system-of-record view; the existing per-patient `ImagingStudyRow` (Medical Record) and `TreatmentImagingOrderRow` (Treatment Sheet) tabs remain the patient-centric lenses over the same underlying facts.

---

## 3. User Journey

1. A radiology technologist, radiologist, or front-desk staff opens **Radiology** from the sidebar.
2. The stats strip and critical-findings banner give an instant read on backlog and patient-safety issues before any action is taken.
3. **Order intake:** a doctor's order arrives in **Imaging Orders** as `Ordered`/waiting-for-scheduling. Staff use filters (department, modality, priority, status, date range) or quick filters ("STAT Only", "Unscheduled") to find their queue.
4. **Scheduling:** a scheduler assigns examination room, modality, technician, and time slot in **Scheduling**; reschedule/cancel/reassign and drag-and-drop reordering handle conflicts.
5. **Arrival & Queue:** when the patient checks in, the order moves into **Examination Queue** as `Waiting`, then `Called`, then `In Progress` as the technologist begins imaging.
6. **Imaging & Upload:** once imaging completes, the order is marked `ImagingCompleted` then `ImageUploaded`; **Study Tracking** shows a timestamped timeline of every stage and a study info card with thumbnail/comparison placeholders and a PACS viewer placeholder (no real DICOM viewer is implemented).
7. **Reporting:** the assigned radiologist opens **Radiologist Reporting & Verification**, drafts Clinical Indication, Technique, Findings, Impression, and Recommendations (optionally from a Template/Favorite), attaches files, and the draft auto-saves.
8. **Critical Findings:** if the radiologist flags a Critical/Urgent/Incidental/Follow-up finding, it raises an alert immediately, visible in the banner and the **Critical Findings** tab with severity, suggested acknowledgement, and notification status.
9. **Verification:** a second radiologist reviews the report and Approves, Rejects, or Returns for Revision; verification timestamps the verifying radiologist.
10. **Release & Distribution:** once verified, the report releases; staff can open the **Patient Study Drawer** to view imaging history, print the report, export PDF, open PACS (placeholder), or jump to the patient's EMR.
11. Dashboard charts (imaging volume, TAT, modality utilization, pending reports, critical findings, radiologist workload, equipment utilization) let radiology management spot bottlenecks without leaving the page.

---

## 4. Layout & Wireframes

### 4.1 Sticky Module Header
`position: sticky; top: 0`. Left: title "Radiology", subtitle "Radiology Information System". Right: global search (order #/patient/MRN), "New Order" button (routes to order-creation — placeholder action until a clinical ordering flow exists elsewhere).

### 4.2 Critical Findings Alerts Banner
Same visual treatment as Laboratory's Critical Alerts banner: horizontally scrollable chips, severity-sorted (Critical → Urgent → Incidental → Follow-up Required), each with icon, message, patient/order reference, raised time, Acknowledge action. Hidden entirely when zero active alerts.

### 4.3 Dashboard Statistics Strip
9 `StatCardComponent` tiles: Total Imaging Orders, Waiting for Scheduling, Scheduled Studies, In Progress, Pending Reporting, Pending Verification, Completed Studies, Critical Findings (danger tone), Avg TAT (hours). Wraps to 4 columns on tablet, 2 on mobile.

### 4.4 Filter Bar (Imaging Orders tab)
Row of `BooSelect`/`BooInput` controls: Department, Ward, Patient/MRN/Visit/Order #, Modality, Examination Type, Priority, Status, Radiologist, Technician, Date Range. Quick-filter toggle chips ("STAT Only", "Unscheduled", "Critical Only").

### 4.5 Tab Bar
Same visual treatment as `AdminLaboratoryComponent`: icon + label, `role="tablist"`, bottom-border active indicator, horizontally scrollable on narrow viewports. Tabs: Dashboard, Imaging Orders, Scheduling, Examination Queue, Study Tracking & Image Review, Radiologist Reporting & Verification, Critical Findings.

### 4.6 Tab Content
- **Dashboard:** KPI recap + 7 lightweight CSS-rendered trend visualizations (no new chart dependency): Imaging Volume (bar), Turnaround Time trend (bar), Modality Utilization (horizontal bar/legend), Pending Reports (horizontal bar by status), Critical Findings rate (donut via conic-gradient), Radiologist Workload (leaderboard), Equipment Utilization (horizontal bar by room/modality).
- **Imaging Orders:** table — Order #, Patient, MRN, Department, Ward, Examination, Modality, Ordering Doctor, Priority (badge), Scheduled Time, Status (badge), Report Status (badge), Order Time. Search, filter, sort, pagination, bulk selection (bulk reschedule, bulk cancel), grouping by Department/Modality. Row action → opens Patient Study Drawer.
- **Scheduling:** card/list per slot grouped by Examination Room — Modality, Technician, Scheduled Time, Estimated Duration, Preparation Instructions; actions Reschedule, Cancel, Reassign; `cdkDropList`/`cdkDrag` lets a scheduler drag a slot to a different time/room column.
- **Examination Queue:** five status columns (Waiting, Called, In Progress, Completed, Cancelled) as a simple Kanban-style board; each card shows patient, exam, priority badge, and a "Call Next" / "Start" / "Complete" action that moves it to the next column.
- **Study Tracking & Image Review:** study list on the left, detail panel on the right showing the 9-stage timeline with a timestamp per stage, study information (modality, body part, technique), thumbnail placeholder grid, "Previous/Comparison Studies" list, and a clearly labeled PACS Viewer placeholder block ("PACS integration pending — no viewer implemented").
- **Radiologist Reporting & Verification:** left — structured report form (Clinical Indication, Examination Technique, Findings, Impression, Recommendations, Attachments list, Template/Favorite `BooSelect`, disabled "Voice Dictation (coming soon)" button, auto-save status line); right — verification table (Reporting Radiologist, Verifying Radiologist, Verification Status badge, Verification Time, Approve/Reject/Return for Revision actions routed through `DialogService.confirm()`).
- **Critical Findings:** full table — Severity (badge), Type (Critical/Urgent/Incidental/Follow-up), Description, Patient/Order reference, Acknowledgement Status, Notification Status, Raised At; Acknowledge action.

### 4.7 Patient Study Drawer
Opened via `DrawerComponent` (width 720px), same pattern as Laboratory's `patient-result-drawer.component.ts`. Sections: Patient Summary (name, MRN, visit, department/ward), Imaging History (chronological study list), Previous Reports, Previous/Comparison Studies, Related Laboratory Results, Clinical Notes. Quick Actions: View EMR, Open PACS (placeholder), Print Report, Export PDF.

---

## 5. Component Hierarchy

```
paraclinical/radiology/
├── radiology.component.ts                          (AdminRadiologyComponent — shell: header,
│                                                      critical-findings banner, stats strip, tabs)
├── patient-study-drawer.component.ts                (shared across tabs — opened by row "View";
│                                                      page-local, like laboratory's patient drawer)
└── tabs/
    ├── radiology-dashboard-tab.component.ts
    ├── radiology-orders-tab.component.ts
    ├── radiology-scheduling-tab.component.ts
    ├── radiology-queue-tab.component.ts
    ├── radiology-study-tracking-tab.component.ts
    ├── radiology-reporting-tab.component.ts
    └── radiology-critical-findings-tab.component.ts

shared/types/radiology.ts        (ImagingOrderRow, ImagingExamination, ScheduleSlot, QueueEntry,
                                   StudyTimelineEvent, StudyRecord, RadiologyReport,
                                   RadiologyReportTemplate, CriticalFindingAlert, RadiologyStats,
                                   RadiologyDashboardTrend, RadiologyPatientStudySummary,
                                   ImagingOrderFilter, enums: RadiologyPriority,
                                   ImagingOrderStatus, ReportStatus, QueueStatus,
                                   RadiologyAlertSeverity, RadiologyAlertType)
services/admin/radiology.service.ts        (RadiologyService — mock-fallback pattern, same as
                                             LaboratoryService)
```

**Reused without modification:** `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooInputComponent`, `BooSelectComponent`, `BooTextareaComponent`, `LocalLoadingService`, `ToastService`, `DialogService`, `@angular/cdk/drag-drop`. The existing `ImagingModality` catalog type (`laboratory-imaging.ts`) remains untouched and is only referenced for modality lookups.

**New (this feature):** everything under `paraclinical/radiology/` above, the drawer component, `radiology.ts` types (replacing the previous minimal `RadiologyExam`), and `radiology.service.ts`.

**Not duplicated:** `ImagingStudyRow` (`shared/types/medical-record.ts`, used by the Medical Record imaging tab) and `TreatmentImagingOrderRow` (`shared/types/treatment-sheet.ts`, used by the Treatment Sheet imaging tab) keep modeling a *single patient's* view and are left untouched. This module's `ImagingOrderRow`/`StudyRecord` model the *department's* operational view (the RIS side) — same separation Laboratory's doc made for `LabResultRow` vs. `LabOrderRow`.

---

## 6. UI Specification & Interaction Design

- **Finding severity → tone:** Critical → danger, Urgent → danger, Incidental → warning, Follow-up Required → warning.
- **Order priority → tone:** Stat → danger, Urgent → warning, Routine → neutral.
- **Order status → tone:** ImagingCompleted/ImageUploaded → success, InProgress/Arrived → primary, Ordered/Scheduled → neutral, Cancelled → danger.
- **Report status → tone:** Released/Verified → success, PendingVerification/Reporting → warning, Rejected/ReturnedForRevision → danger, NotStarted → neutral.
- **Queue status → tone:** Completed → success, InProgress/Called → primary, Waiting → neutral, Cancelled → danger.
- **Verification actions:** Approve is single-click (optimistic update + toast). Reject and Return for Revision route through `DialogService.confirm()` requiring a reason, mirroring Laboratory's result-verification pattern.
- **Optimistic UI:** acknowledging a critical finding, advancing a queue entry, and approving/rejecting a report update local signal state immediately; a service error reverts and shows a toast.
- **Keyboard:** tab bar is arrow/Enter navigable; queue cards, schedule slots, and report form fields are fully tabbable; all quick actions reachable via Tab.
- **Drag & drop:** Scheduling tab slots are draggable between room/time columns via `cdkDropList`; drop commits a reschedule call optimistically, reverting with a toast on failure.
- **Auto-save:** the reporting form debounces field changes and calls the mock "save draft" endpoint, showing "Saving…" then "Saved {time}" beside the form header.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full multi-panel workspace: sticky header + alerts + stats strip + horizontal tabs + full-width tables/boards; Study Tracking and Reporting tabs show side-by-side list/detail panels |
| Tablet (768–1279px) | Stats strip wraps to 4×2; Study Tracking/Reporting side panels collapse — detail panel becomes a slide-over triggered from the list; tables scroll horizontally; tab bar remains horizontal |
| Mobile (<768px) | Stats strip collapses to 2 columns; Orders/Queue/Critical Findings become stacked cards (one card per row); Examination Queue columns become a swipeable horizontal strip; tab bar becomes a horizontally scrollable strip |

---

## 8. Accessibility (WCAG 2.1 AA)

- All status/priority/severity badges pair color with text — never color alone.
- Critical Findings banner lives in an `aria-live="polite"` region so new critical findings are announced.
- "Reject" / "Return for Revision" confirmations trap focus until resolved (reuses `DialogComponent`'s existing focus trap).
- Tab buttons use `role="tab"` / `aria-selected`, reachable and operable via keyboard only, with visible focus rings.
- Minimum 44×44px touch targets for all quick-action and verification buttons on tablet/mobile.
- Drag-and-drop scheduling has an equivalent keyboard path: each slot's "Reschedule" button opens a `BooSelect`-based time/room picker so the workflow isn't drag-only.

---

## 9. Page States

- **Loading (initial):** centered spinner + label while the header/stats/alerts payload loads, matching Laboratory's loading treatment.
- **Empty:** each tab shows `EmptyStateComponent` ("No orders match these filters", "No studies awaiting verification", etc.) only after a successful load with zero results.
- **Error:** inline red banner with Retry button at the section level — never a blocking full-page error.
- **Success:** standard populated view.
- **Disabled:** action buttons disable + show inline spinner while their specific `LocalLoadingService` key is in flight; never a global page lock. Report form fields disable while a save/verification request is in flight.

---

## 10. Edge Cases & Exception Handling

- An order is cancelled after scheduling → the schedule slot frees up and the queue entry (if any) is removed; the original order row stays in history marked `Cancelled`.
- A critical finding is flagged while the page is open → surfaces only through the Critical Findings banner once the alerts endpoint reports it; no intrusive modal (avoids alert fatigue, consistent with Laboratory's handling).
- Two radiologists attempt to verify the same report simultaneously → second submit fails gracefully with an "already updated by {user}" toast (client-side error path; real conflict resolution is a backend concern).
- A report is rejected during verification → the order returns to `Reporting` status with the rejection reason visible to the reporting radiologist (no silent loss of the drafted report).
- No orders match the active filter combination → empty state offers a one-click "Clear Filters" action rather than a dead end.
- Equipment-failure or modality-downtime notices surface as a Warning-severity entry in the same Critical Findings banner rather than a separate, competing notification surface.

---

## 11. Performance Considerations

- Header/stats/alerts load via a single `forkJoin` on entry (mirrors `AdminLaboratoryComponent.load`); each tab's own data loads lazily on first activation, not as one giant payload.
- Orders/Queue/Critical Findings tables use `trackBy` (`id`) to avoid full re-renders on optimistic updates.
- All list-returning endpoints are designed against the existing `PaginationData<T>` contract so server-side pagination works without a type change once the backend lands; client-side filtering is a stopgap over the mock data only.
- Dashboard trend visualizations are pure CSS (no charting library), keeping the module dependency-free and avoiding the "no npm install" build constraint.

---

## 12. Scalability & Enterprise Recommendations

- Keep `RadiologyService` on the same mock-fallback pattern as `LaboratoryService` so backend cutover requires zero caller changes.
- Model `ImagingOrderRow`, `ScheduleSlot`, `QueueEntry`, `StudyRecord`, `RadiologyReport`, and `CriticalFindingAlert` as first-class types now (not `any`) so downstream features (billing triggers, accreditation reporting) can be layered in without a type rewrite.
- Keep the order-centric Radiology module's types separate from the patient-centric `ImagingStudyRow` (Medical Record) and `TreatmentImagingOrderRow` (Treatment Sheet) view models — each serves a different workflow lens over what should eventually be the same backend facts.
- `dicomStudyUid` is modeled as a plain optional string now (matching the existing convention in `medical-record.ts`) so a real PACS/DICOM integration can be wired in later without a type or component-contract change.
- Quick Filters are modeled as plain client-side state for now (per the mock-fallback approach); the API contract already includes a saved-filter endpoint (§13) so persistence can be added without a UI rewrite.

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping via existing auth middleware (not repeated per row). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Get dashboard stats | GET | `/api/radiology/stats?from=&to=` | query params | `RadiologyStats` | Stats strip |
| 2 | Get dashboard trends | GET | `/api/radiology/trends?from=&to=` | query params | `RadiologyDashboardTrend` | Dashboard tab charts |
| 3 | Get active critical findings | GET | `/api/radiology/alerts` | — | `CriticalFindingAlert[]` | Alerts banner + Critical Findings tab |
| 4 | Acknowledge a finding | POST | `/api/radiology/alerts/{alertId}/acknowledge` | `{ note?: string }` | `string` (id) | Alert chip/row dismiss |
| 5 | Search imaging orders | GET | `/api/radiology/orders/search` | `PagedRequest<ImagingOrderFilter>` | `PaginationData<ImagingOrderRow>` | Imaging Orders tab |
| 6 | Get order detail | GET | `/api/radiology/orders/{orderId}` | — | `ImagingOrderRow` | Patient Study Drawer / row expand |
| 7 | Bulk update order status | PATCH | `/api/radiology/orders/bulk-status` | `{ orderIds: string[], status: ImagingOrderStatus }` | `string[]` (updated ids) | Orders tab bulk action |
| 8 | Search schedule slots | GET | `/api/radiology/schedule/search` | `PagedRequest<{ from: string; to: string }>` | `PaginationData<ScheduleSlot>` | Scheduling tab |
| 9 | Reschedule a slot | PATCH | `/api/radiology/schedule/{slotId}/reschedule` | `{ scheduledTime: string, roomId: string }` | `ScheduleSlot` | Scheduling reschedule / drag-drop drop |
| 10 | Cancel a slot | POST | `/api/radiology/schedule/{slotId}/cancel` | `{ reason: string }` | `ScheduleSlot` | Scheduling cancel action |
| 11 | Reassign technician | PATCH | `/api/radiology/schedule/{slotId}/reassign` | `{ technicianId: string }` | `ScheduleSlot` | Scheduling reassign action |
| 12 | Get examination queue | GET | `/api/radiology/queue` | query: room/modality | `QueueEntry[]` | Examination Queue tab |
| 13 | Advance queue entry | PATCH | `/api/radiology/queue/{entryId}/advance` | `{ status: QueueStatus }` | `QueueEntry` | "Call Next"/"Start"/"Complete" actions |
| 14 | Get study detail + timeline | GET | `/api/radiology/studies/{studyId}` | — | `StudyRecord` (incl. `StudyTimelineEvent[]`) | Study Tracking & Image Review tab |
| 15 | Search studies | GET | `/api/radiology/studies/search` | `PagedRequest<ImagingOrderFilter>` | `PaginationData<StudyRecord>` | Study Tracking list panel |
| 16 | Get/save report draft | GET/PATCH | `/api/radiology/reports/{orderId}` | `{ clinicalIndication, technique, findings, impression, recommendations, templateId? }` | `RadiologyReport` | Reporting tab form + auto-save |
| 17 | List report templates | GET | `/api/radiology/report-templates` | — | `RadiologyReportTemplate[]` | Reporting tab Template/Favorite picker |
| 18 | Verify (approve) a report | POST | `/api/radiology/reports/{orderId}/approve` | `{ verifierId: string }` | `RadiologyReport` | "Approve" action |
| 19 | Reject a report | POST | `/api/radiology/reports/{orderId}/reject` | `{ reason: string }` | `RadiologyReport` | "Reject" action |
| 20 | Return a report for revision | POST | `/api/radiology/reports/{orderId}/return-for-revision` | `{ reason: string }` | `RadiologyReport` | "Return for Revision" action |
| 21 | Get patient imaging summary (drawer) | GET | `/api/radiology/patients/{patientId}/summary` | — | `RadiologyPatientStudySummary` | Patient Study Drawer |
| 22 | Get patient imaging history (drawer) | GET | `/api/radiology/patients/{patientId}/history` | paged query | `PaginationData<ImagingOrderRow>` | Patient Study Drawer history list |
| 23 | Export a report as PDF | GET | `/api/radiology/orders/{orderId}/export` | — | binary (`application/pdf`) | "Print Report" / "Export PDF" quick action |
| 24 | List saved filters | GET | `/api/radiology/saved-filters` | — | `SavedView[]` | Filter bar "Saved Filters" |
| 25 | Save a new filter view | POST | `/api/radiology/saved-filters` | `{ name: string, filter: ImagingOrderFilter }` | `SavedView` | Filter bar "Save current filter" |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/radiology-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/radiology.ts`
- [x] Service: `src/app/services/admin/radiology.service.ts` (mock-fallback)
- [x] `RADIOLOGY` block in `src/app/shared/api/base.ts`
- [x] Route kept at `/admin/paraclinical/radiology`
- [x] Components: shell + 7 tabs (Dashboard, Imaging Orders, Scheduling, Examination Queue, Study Tracking & Image Review, Radiologist Reporting & Verification, Critical Findings) + Patient Study Drawer
