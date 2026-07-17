# Treatment Sheet Module Redesign — Enterprise Inpatient Treatment Workspace

**Path:** `admin/inpatient/treatment-sheet`
**Current implementation:** `src/app/pages/admin/inpatient/treatment-sheet/treatment-sheet.component.ts` — a single monolithic component with hardcoded mock arrays, `ngModel`-bound "new record" forms, no services, no patient context, and an `ngSwitch` tab strip (`vitals` / `medications` / `procedures` / `notes` / `fluid`).
**Scope:** Frontend UI/UX only. No backend implementation — see §13 for the proposed API contract. Reuses existing conventions established by the Nursing module (`docs/nursing-redesign.md`) and the Medical Record EMR module: standalone components, Angular signals, `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIcon`, `BooSelect`, `BooInput`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, mock-fallback services.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Patient context | Two hardcoded `<p>` tags ("asd" / "asdy / asd") | No real patient identity, MRN, visit, bed/ward, diagnosis, allergies, or isolation status — clinically unsafe placeholder data |
| Tabs | `ngSwitch` over a plain string with 5 hardcoded cases | No icons, no counts/badges, not keyboard-navigable, doesn't scale to additional order types (lab/imaging/doctor orders are entirely absent) |
| Data | Arrays of mock objects assigned directly on the class | No service layer; `alert()` used for all validation/feedback; nothing persists or could be wired to a backend without a full rewrite |
| Vitals | Static history table with hardcoded `12:00` time cell regardless of row data | History is not real — every row literally shows the same time |
| Medications | Renders an MAR-style table shell with an **empty `<tbody>`** | Medication administration rows are never rendered — feature is non-functional |
| Orders | Not modeled at all | No view of active physician orders (doctor/lab/imaging/nursing orders) — the actual "treatment sheet" concept is missing |
| Timeline | Not modeled at all | No chronological cross-category view of what happened to the patient and when |
| Laboratory / Imaging | Not modeled at all | No way to see ordered tests, sample/result status, critical flags, or imaging study status from this page |
| Clinical alerts | Not modeled at all | Allergy/interaction/critical-lab/critical-vitals/isolation risks are invisible on the one page where clinicians most need them |
| Dashboard stats | Not modeled at all | No at-a-glance counts (active/completed/pending orders, meds due, critical alerts, pending labs/imaging) |
| Loading/empty/error states | None | Page assumes data always exists; no skeletons, no empty states, no error/retry |
| Responsiveness | Fixed grid breakpoints only, no tablet-specific collapsing | Tablet/mobile bedside use (the primary device class for nurses) is not considered |
| Accessibility | No ARIA roles on tabs, no focus management | Tabs are not screen-reader or keyboard navigable |

**Root cause:** the page was built as a flat demo with no data layer, no patient routing, and no shared-component reuse — it predates the Nursing/Medical-Record enterprise patterns already established elsewhere in this codebase.

---

## 2. Information Architecture

```
Treatment Sheet (/admin/inpatient/treatment-sheet?patientId=...)
├── Sticky Patient Summary Header
│   (MRN, Visit #, Bed/Ward/Department, Admission Date, LOS, Primary Diagnosis,
│    Allergies, Isolation Status, Attending Doctor, Print/Export actions)
├── Clinical Alerts Banner (Allergy / Drug Interaction / Abnormal Lab / Critical Vitals /
│    Infection Control / Isolation / Pending Critical Order — severity-sorted, dismissible)
├── Dashboard Statistics Strip (Active / Completed / Pending Orders, Medication Due,
│    Critical Alerts, Pending Labs, Pending Imaging)
├── Quick Actions Row (Add Order, Add Progress Note, View Medication, View Laboratory,
│    View Imaging, Print Sheet, Export PDF)
├── Tab: Overview         (snapshot — recent timeline, open orders, active alerts)
├── Tab: Timeline         (full chronological feed, Today/24h/7d/Custom range)
├── Tab: Orders           (active physician orders, search/filter/sort/group)
├── Tab: Medications      (MAR — timeline view + table view toggle)
├── Tab: Procedures       (status, department, performer, schedule)
├── Tab: Laboratory       (ordered tests, sample/result status, critical flag)
├── Tab: Imaging          (requests, status, report/image availability)
└── Tab: Notes            (doctor / nursing / consultation notes, chronological)
```

**Key IA decision:** the page is patient-centric (one treatment sheet per active admission), matching the Nursing Patient Chart and Medical Record patterns already in the codebase, rather than bed-centric. `patientId` is read the same way `medical-record` does — route param, then query param, then a development fallback id — so the page works both as a standalone route and as a drill-in target from Bed Map / Nursing / Admission.

---

## 3. User Journey

1. A doctor, nurse, or pharmacist opens a patient's Treatment Sheet from Bed Map, Nursing Dashboard, or a direct link (`?patientId=`).
2. The sticky header confirms identity (MRN, bed/ward, diagnosis, allergies, isolation) before any clinical action is taken.
3. The Clinical Alerts banner surfaces anything that must be triaged first (critical lab, allergy conflict, isolation).
4. The Overview tab gives a fast snapshot: what happened recently, what's still open, what's overdue.
5. The clinician switches to the relevant tab (Orders to review/add orders, Medications to administer/document a dose, Procedures/Laboratory/Imaging to check status, Notes to document).
6. Quick Actions let the user jump straight to "Add Order" or "Add Progress Note" without leaving the page (opens the relevant tab/drawer).
7. Stats and alert counts update optimistically as actions are taken (mark given, acknowledge alert, add note) — no full page reload.
8. At any point the user can Print Sheet / Export PDF for the physical chart or compliance record.

---

## 4. Layout & Wireframes

### 4.1 Sticky Patient Summary Header
`position: sticky; top: 0`. Left: avatar/initials, patient name, MRN · Visit # · Bed · Ward · Department. Right: Admission Date, Length of Stay (computed), Attending Doctor. Below: a badge row — Primary Diagnosis, Isolation Status (if any), Allergy count badge (click → Overview alerts). Far right: Print Sheet / Export PDF icon buttons.

### 4.2 Clinical Alerts Banner
Horizontally scrollable chips sorted Critical → High → Warning → Information, each: icon, message, raised time, dismiss/acknowledge. Hidden entirely when zero active alerts (no empty placeholder banner), matching the Nursing Dashboard pattern.

### 4.3 Dashboard Statistics Strip
7 `StatCardComponent` tiles: Active Orders, Completed Orders, Pending Orders, Medication Due, Critical Alerts (danger tone), Pending Labs, Pending Imaging. Wraps to 2 columns on tablet, 1 column on mobile.

### 4.4 Quick Actions Row
Icon + label buttons: Add Order, Add Progress Note, View Medication, View Laboratory, View Imaging, Print Sheet, Export PDF. Each routes to the relevant tab (and opens the relevant inline form where applicable) rather than duplicating logic.

### 4.5 Tab Bar
Same visual treatment as `AdminNursingPatientComponent` / `AdminMedicalRecordComponent`: icon + label + optional count badge, `role="tablist"`, bottom-border active indicator, horizontally scrollable on narrow viewports.

### 4.6 Tab Content
- **Overview:** mini timeline (last 8 entries), open orders count by type, active alerts list, quick stats recap.
- **Timeline:** full chronological list grouped by day, range selector (Today / Last 24 Hours / Last 7 Days / Custom — `BooSelect` + date inputs for Custom), category filter chips, icon per category (doctor order, medication, procedure, lab, imaging, nursing activity, progress note, completed task).
- **Orders:** table (search, type/status/priority/department/doctor filters, sortable columns, "Group by Category" toggle) — Order Type, Order Name, Priority badge, Frequency, Start/End Time, Ordering Doctor, Status badge.
- **Medications:** view toggle (Timeline / Table). Table: Medication, Dose, Route, Frequency, Scheduled Time, Status badge, Administered By, Notes, one-tap Mark Given / Mark Missed (Missed routes through `DialogService.confirm()`).
- **Procedures:** card/list — Name, Status badge, Department, Scheduled/Completion time, Performer; "Add Procedure" inline form.
- **Laboratory:** table — Test, Sample Status, Result Status, Critical flag (badge), Ordered At, quick "View Result" link (placeholder action until lab report endpoint exists).
- **Imaging:** table — Study, Status, Report Available, Images Available, Scheduled time, quick "View Report" / "View Images" links (placeholder actions).
- **Notes:** chronological timeline filterable by type (Doctor / Nursing / Consultation), inline "Add Note" form.

---

## 5. Component Hierarchy

```
inpatient/treatment-sheet/
├── treatment-sheet.component.ts                 (AdminTreatmentSheetComponent — shell, signals, patientId resolution)
└── tabs/
    ├── treatment-overview-tab.component.ts
    ├── treatment-timeline-tab.component.ts
    ├── treatment-orders-tab.component.ts
    ├── treatment-medications-tab.component.ts
    ├── treatment-procedures-tab.component.ts
    ├── treatment-laboratory-tab.component.ts
    ├── treatment-imaging-tab.component.ts
    └── treatment-notes-tab.component.ts

shared/types/treatment-sheet.ts        (TreatmentPatientSummary, TreatmentStats, ClinicalAlert,
                                         TreatmentTimelineEntry, TreatmentOrder, MedicationAdministration,
                                         TreatmentProcedureRow, TreatmentLabOrderRow, TreatmentImagingOrderRow,
                                         TreatmentProgressNote, filters, enums)
services/admin/treatment-sheet.service.ts        (TreatmentSheetService — mock-fallback pattern, same as NursingService)
```

**Reused without modification:** `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `BooTextareaComponent`, `LocalLoadingService`, `ToastService`, `DialogService`.

**New (this feature):** everything under `treatment-sheet/` above, plus `treatment-sheet.ts` types and `treatment-sheet.service.ts`.

---

## 6. UI Specification & Interaction Design

- **Alert severity → tone:** Critical → danger, High → danger (lighter icon weight), Warning → warning, Information → primary/neutral. Color is always paired with an icon + text label.
- **Order priority → tone:** Stat → danger, Urgent → warning, Routine → neutral.
- **Order/administration status → tone:** Active/Given/Completed → success, Pending/Scheduled → primary, Missed/Cancelled → danger, OnHold/Held → warning.
- **MAR actions:** "Mark Given" is single-click (optimistic update + toast). "Mark Missed" routes through `DialogService.confirm()` requiring acknowledgement, mirroring the Nursing MAR tab's `markMissed()` pattern.
- **Optimistic UI:** acknowledging an alert, marking an order/medication/task, and adding a note update local signal state immediately; a service error reverts state and shows a toast (same approach as Nursing Dashboard `acknowledgeAlert`).
- **Keyboard:** tab bar is arrow/Enter navigable; table rows focusable; all quick actions reachable via Tab.
- **Group by Category (Orders tab):** client-side grouping toggle over the already-loaded order list — no extra request.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full multi-panel workspace: sticky header + stats strip + horizontal tabs + full-width tables |
| Tablet (768–1279px) | Stats strip wraps to 2×4; tables scroll horizontally; tab bar remains horizontal, icon+label retained |
| Mobile (<768px) | Stats strip collapses to 1 column; Orders/Medications/Procedures/Lab/Imaging tables become stacked cards; Timeline becomes a single-column expandable list; tab bar becomes a horizontally scrollable strip |

---

## 8. Accessibility (WCAG 2.1 AA)

- All status/priority/severity badges pair color with text (and icon for alerts) — never color alone.
- Alerts banner lives in an `aria-live="polite"` region so new critical alerts are announced.
- "Mark Missed" / "Mark Held" confirmation traps focus until resolved (reuses `DialogComponent`'s existing focus trap).
- Tab buttons use `role="tab"` / `aria-selected`, reachable and operable via keyboard only, with visible focus rings.
- Minimum 44×44px touch targets for all quick-action and MAR/order action buttons on tablet/mobile.

---

## 9. Page States

- **Loading (initial):** centered spinner + label while the header/stats/alerts payload loads; matches Nursing Patient Chart's loading treatment.
- **Empty:** each tab shows `EmptyStateComponent` ("No orders for this admission", "No medications scheduled", etc.) only after a successful load with zero results.
- **Error:** inline red banner with Retry button at the section level — never a blocking full-page error (matches Nursing Dashboard's error treatment).
- **Success:** standard populated view.
- **Disabled:** action buttons disable + show inline spinner while their specific `LocalLoadingService` key is in flight; never a global page lock.

---

## 10. Edge Cases & Exception Handling

- Patient discharged while the sheet is open → header shows a dismissible "Patient discharged" banner; mutation actions (mark given, add order, add note) disable, page stays read-only.
- Two users mark the same order/MAR entry simultaneously → second submit fails gracefully with an "already updated by {user}" toast (client-side error path; real conflict resolution is a backend concern).
- Critical lab/imaging result arrives while the page is open → surfaces only through the Clinical Alerts banner once the alerts endpoint reports it; no intrusive modal (avoids alert fatigue, consistent with the Nursing module's vitals-abnormal handling).
- No active admission found for the requested `patientId` → page shows a top-level empty state ("No active admission found") instead of rendering a header with blank fields.
- Add Note / Add Order submitted with required fields missing → inline validation message, never a blocking native `alert()` (replacing the current implementation's `alert()` calls).

---

## 11. Performance Considerations

- Header/stats/alerts load via a single `forkJoin` on entry (mirrors `AdminMedicalRecordComponent.loadAll`); each tab's own data loads lazily on first activation via `ngOnChanges` (mirrors the Nursing Patient Chart tabs), not as one giant payload.
- Timeline and Orders lists use `trackBy` (`id`) to avoid full re-renders on optimistic updates.
- Lab/Imaging/Orders tables are designed against the existing `PaginationData<T>` contract so pagination can be added without a type change once the backend lands.

---

## 12. Scalability & Enterprise Recommendations

- Keep `TreatmentSheetService` on the same mock-fallback pattern as `NursingService` / `MedicalRecordService` so backend cutover requires zero caller changes.
- Model `TreatmentOrder`, `MedicationAdministration`, `TreatmentProcedureRow`, `TreatmentLabOrderRow`, and `TreatmentImagingOrderRow` as first-class types now (not `any`) so downstream features (CDS alerts, billing triggers) can be layered in without a type rewrite.
- The Treatment Sheet intentionally does not duplicate the Nursing module's `MarEntry`/`VitalsReading` data — it presents the same clinical facts from a multi-disciplinary (doctor + nurse + pharmacist) lens with a different field shape (`MedicationAdministration` includes `frequency`/`notes` for chart-printing). If/when a single canonical MAR source of truth is introduced server-side, both modules should read from it without changing their respective view models.
- Treatment Sheet route stays separate from `/admin/nursing/patient/:id` and `/admin/clinic/medical-record` — each serves a distinct workflow (ward-based inpatient chart vs. nurse's shift assignment vs. full longitudinal EMR) even though they share the same patient and some underlying clinical facts.

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping via existing auth middleware (not repeated per row). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Get patient treatment-sheet summary | GET | `/api/treatment-sheet/patients/{patientId}/summary` | — | `TreatmentPatientSummary` | Sticky header |
| 2 | Get dashboard stats | GET | `/api/treatment-sheet/patients/{patientId}/stats` | — | `TreatmentStats` | Stats strip |
| 3 | Get active clinical alerts | GET | `/api/treatment-sheet/patients/{patientId}/alerts` | — | `ClinicalAlert[]` | Alerts banner |
| 4 | Acknowledge an alert | POST | `/api/treatment-sheet/alerts/{alertId}/acknowledge` | `{ note?: string }` | `string` (id) | Alert chip dismiss |
| 5 | Get treatment timeline | GET | `/api/treatment-sheet/patients/{patientId}/timeline?range=Today\|Last24Hours\|Last7Days\|Custom&from=&to=` | query params | `TreatmentTimelineEntry[]` | Overview + Timeline tabs |
| 6 | Get active treatment orders | GET | `/api/treatment-sheet/patients/{patientId}/orders` | paged query | `PaginationData<TreatmentOrder>` | Orders tab |
| 7 | Create a treatment order | POST | `/api/treatment-sheet/patients/{patientId}/orders` | `TreatmentOrder` (no id) | `TreatmentOrder` | "Add Order" quick action |
| 8 | Update order status | PATCH | `/api/treatment-sheet/orders/{orderId}` | `{ status: OrderStatus }` | `TreatmentOrder` | Orders tab status change |
| 9 | Get medication administration record | GET | `/api/treatment-sheet/patients/{patientId}/medications` | paged query | `PaginationData<MedicationAdministration>` | Medications tab |
| 10 | Update medication administration status | PATCH | `/api/treatment-sheet/medications/{entryId}` | `{ status: 'Given'\|'Missed'\|'Refused'\|'Held', notes?: string }` | `MedicationAdministration` | "Mark Given/Missed" |
| 11 | Get procedures | GET | `/api/treatment-sheet/patients/{patientId}/procedures` | paged query | `PaginationData<TreatmentProcedureRow>` | Procedures tab |
| 12 | Add a procedure record | POST | `/api/treatment-sheet/patients/{patientId}/procedures` | `TreatmentProcedureRow` (no id) | `TreatmentProcedureRow` | Procedures "Add Procedure" |
| 13 | Get laboratory orders | GET | `/api/treatment-sheet/patients/{patientId}/labs` | paged query | `PaginationData<TreatmentLabOrderRow>` | Laboratory tab |
| 14 | Get imaging orders | GET | `/api/treatment-sheet/patients/{patientId}/imaging` | paged query | `PaginationData<TreatmentImagingOrderRow>` | Imaging tab |
| 15 | Get progress notes | GET | `/api/treatment-sheet/patients/{patientId}/notes` | paged query | `PaginationData<TreatmentProgressNote>` | Notes tab |
| 16 | Add a progress note | POST | `/api/treatment-sheet/patients/{patientId}/notes` | `{ type: ProgressNoteType, content: string }` | `TreatmentProgressNote` | Notes "Add Note" |
| 17 | Export treatment sheet as PDF | GET | `/api/treatment-sheet/patients/{patientId}/export` | — | binary (`application/pdf`) | "Export PDF" quick action |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/treatment-sheet-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/treatment-sheet.ts`
- [x] Service: `src/app/services/admin/treatment-sheet.service.ts` (mock-fallback)
- [x] `TREATMENT_SHEET` block in `src/app/shared/api/base.ts`
- [x] Route kept at `/admin/inpatient/treatment-sheet` (patient resolved via route/query param, same pattern as Medical Record)
- [x] Components: shell + 8 tabs (Overview, Timeline, Orders, Medications, Procedures, Laboratory, Imaging, Notes)
