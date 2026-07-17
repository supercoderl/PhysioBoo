# Surgery Module Redesign — Enterprise Operating Room Management System (ORMS)

**Path:** `admin/paraclinical/surgery`
**Current implementation:** `src/app/pages/admin/paraclinical/surgery/surgery.component.ts` — a single demo component bound to a flat `Surgery[]` array populated by `initializeSampleData()`. 6 static stat cards, 4 hardcoded operating-room cards, a category quick-filter row, a single filter bar (search/status/priority/date), one flat table, and a static pagination footer. All actions (`viewDetails`, `editSurgery`, `printSchedule`, `cancelSurgery`, `openScheduleSurgeryModal`) call `alert()`/`confirm()`. No service, no drawer, no workflow beyond "list of surgeries."
**Scope:** Frontend UI/UX only. No backend implementation — see §13 for the proposed API contract. Reuses the conventions already established by the Laboratory module (`docs/laboratory-redesign.md`) and Treatment Sheet module: standalone components, Angular signals, `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIcon`, `BooSelect`, `BooInput`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, mock-fallback services.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Data model | Single `Surgery` interface (16 fields) mixing patient, scheduling, and team data | No order/OR/team/equipment/checklist/timeline model — cannot represent a real surgical workflow |
| Sample data | `initializeSampleData()` hardcodes 9 surgeries directly in the component | No service layer, nothing demoable beyond a fixed snapshot |
| Operating rooms | 4 hardcoded rooms (`OR-1`..`OR-4`) as a plain array literal in the component | Not data-driven, no equipment/cleaning/maintenance state, can't scale past 4 rooms |
| Actions | `viewDetails`/`editSurgery`/`printSchedule`/`openScheduleSurgeryModal` call `alert()`; `cancelSurgery` calls `confirm()` | No drawer, no real navigation, blocks the UI thread, not accessible |
| Workflow | None — a single flat list with a status enum | No concept of scheduling → pre-op → intra-op → post-op → discharge, which is the entire point of an ORMS |
| Surgical team | Two free-text fields (`surgeon`, `anesthesiologist?`) | No assistant surgeon, scrub nurse, circulating nurse, technician, no assignment/replacement/availability |
| Equipment & implants | Not modeled at all | No instrument sets, implants, consumables, sterilization status — a patient-safety and billing requirement |
| Pre-operative checklist | Not modeled | No identity verification, consent, site marking, timeout verification — a Joint Commission / WHO Surgical Safety Checklist requirement |
| Intra-operative tracking | Not modeled | No progress, remaining time, blood loss, complications |
| Post-operative | Not modeled | No PACU assignment, recovery status, follow-up orders |
| Clinical alerts | Not modeled | No missing-consent, allergy, equipment-missing, delayed-surgery, or OR-conflict alerting |
| Dashboard | 6 static `<svg>` cards wired to `getSurgeriesByStatus(status)` against the flat array | No real KPIs (OR utilization, delay rate, avg duration), no charts |
| Filters | Search + status + priority + date, client-side only, `ngModel` | No OR/department/surgeon/assistant/anesthesiologist/patient/MRN/emergency-level filtering, no saved/quick filters |
| Loading/empty/error states | None | No skeletons, no real empty state, no error/retry |
| Accessibility | Native `alert()`/`confirm()`, no `role="tab"` (no tabs exist) | Screen readers and keyboard users hit blocking dialogs with no programmatic context |
| Responsiveness | Single fixed breakpoint (`md`/`lg`) | No tablet/mobile-specific behavior for staff using shared OR terminals/tablets |

**Root cause:** the page was built as a flat demo bound to a single oversimplified model, predating the Laboratory / Treatment Sheet enterprise patterns already established elsewhere in this codebase, and never modeled the actual perioperative workflow (scheduling → OR assignment → pre-op → intra-op → post-op/PACU).

---

## 2. Information Architecture

```
Surgery (/admin/paraclinical/surgery)
├── Sticky Module Header
│   (Title, global search, date-range selector, "Schedule Surgery" action)
├── Dashboard Statistics Strip (Total Scheduled, Ongoing, Completed, Delayed, Emergency,
│    Available ORs, Occupied ORs, Avg Duration, OR Utilization Rate)
├── Clinical Alerts Banner (Missing Consent / Allergy / Equipment Missing / Delayed /
│    Critical Lab / Critical Imaging / Blood Not Available / OR Conflict —
│    severity-sorted, acknowledgeable, dismissible when empty)
├── Filter & Quick-Filter Bar (OR, Department, Surgeon, Assistant Surgeon, Anesthesiologist,
│    Patient/MRN, Surgery Type, Priority, Status, Emergency Level, Date)
├── Tab: Dashboard          (KPI recap + trend visualizations: OR utilization, surgery volume,
│                             delay rate, emergency cases, procedure distribution, avg duration,
│                             cancellation rate)
├── Tab: Schedule           (Table / Timeline / Calendar view toggle — drag-free table is the
│                             primary enterprise view; Timeline shows a per-room swimlane for the
│                             selected day; Calendar groups surgeries by day across the week)
├── Tab: Operating Rooms    (one card per OR: number, current surgery, surgeon, patient, start/
│                             est. finish, equipment status, room status)
├── Tab: Surgical Queue     (today's pre-op queue — Scheduled → Patient Arrived → Pre-Op Ready →
│                             Anesthesia Started; row expands to the Pre-operative Checklist)
├── Tab: Intra-Operative    (rooms currently In Surgery — progress, est. remaining time, team,
│    Tracking                 notes, complications, blood loss, implant usage)
└── Tab: Post-Operative     (rooms/patients in Recovery/PACU — recovery status, PACU assignment,
     Recovery                 post-op notes, complications, follow-up orders)

Drawer: Surgery Detail Drawer (opened from any tab's row "View")
  — Patient Summary (diagnosis, surgical history, allergies, labs, radiology, medications,
    consent, risk assessment), Surgical Team, Equipment & Consumables, Pre-operative Checklist,
    Surgical Timeline, Notes. Quick Actions: View EMR, Print Consent, View Images,
    Open Treatment Sheet.
```

**Key IA decision:** like Laboratory, Surgery is **OR-centric and queue-centric**, not patient-centric — surgical staff and OR coordinators work across many concurrent rooms and patients, not one patient at a time. The **Surgery Detail Drawer** is the single place to drill into one patient/case in depth (team, checklist, equipment, timeline) without leaving the active tab's queue, mirroring exactly how the Laboratory module's Patient Result Drawer works. The five tabs (Schedule, Operating Rooms, Surgical Queue, Intra-Operative Tracking, Post-Operative Recovery) represent five different operational lenses over the same underlying `SurgeryCase` records — Schedule is the planning view, Operating Rooms is the room-state view, Queue/Intra-Op/Post-Op are the three perioperative-phase views.

---

## 3. User Journey

1. An OR coordinator, surgeon, anesthesiologist, or perioperative nurse opens **Surgery** from the sidebar.
2. The stats strip and clinical alerts banner give an instant read on today's caseload, OR availability, and patient-safety issues before any action is taken.
3. **Scheduling:** a case arrives (from a clinical order elsewhere in the system, out of scope here) and appears in the **Schedule** tab. Staff use Filters (OR, department, surgeon, priority, status, date) or Quick Filters ("Today", "Emergency Only", "My Cases") to find what they need. Table/Timeline/Calendar views give different at-a-glance read on the same data.
4. **Room assignment:** OR coordinators check the **Operating Rooms** tab to see which rooms are `Available`/`Cleaning`/`Maintenance` before confirming a room assignment for a scheduled case.
5. **Pre-operative phase:** on the day of surgery, the case appears in **Surgical Queue**. Staff walk through patient arrival, identity verification, consent, allergy review, site marking, lab/imaging review, blood/implant availability, equipment readiness, and the WHO-style timeout — each item on the **Pre-operative Checklist** is digitally signed off inside the Surgery Detail Drawer.
6. **Intra-operative phase:** once surgery starts, the case moves to **Intra-Operative Tracking**, showing live progress, estimated remaining time, team status, and a running log of notes/complications/blood loss/implant usage.
7. **Post-operative phase:** once the procedure completes, the case moves to **Post-Operative Recovery** — PACU assignment, recovery status, post-op notes, complications, and follow-up orders are tracked until discharge from OR/PACU.
8. **Clinical Alerts:** any missing consent, allergy conflict, missing equipment, delayed surgery, critical lab/imaging result, blood unavailability, or OR scheduling conflict appears in the banner and the Clinical Alerts tab until acknowledged, each with severity and a suggested action.
9. Dashboard charts (OR utilization, surgery volume, delay rate, emergency cases, procedure distribution, avg duration, cancellation rate) let OR management spot bottlenecks — e.g. a chronically under-utilized room or a surgeon with a high delay rate — without leaving the page.
10. From any tab, "View" opens the **Surgery Detail Drawer** for the full clinical picture and quick actions (View EMR, Print Consent, View Images, Open Treatment Sheet).

---

## 4. Layout & Wireframes

### 4.1 Sticky Module Header
`position: sticky; top: 0`. Left: title "Surgery", subtitle "Operating Room Management System". Right: global search (surgery #/patient/MRN), date-range selector (Today/Weekly/Monthly — drives the stats strip and dashboard trends), "Schedule Surgery" button (placeholder action until a clinical ordering flow exists elsewhere).

### 4.2 Clinical Alerts Banner
Same visual treatment as Laboratory's Critical Result Alerts banner: horizontally scrollable chips, severity-sorted (Critical → High → Warning → Information), each with icon, message, patient/surgery reference, raised time, Acknowledge action. Hidden entirely when zero active alerts. Lives in `aria-live="polite"`.

### 4.3 Dashboard Statistics Strip
9 `StatCardComponent` tiles: Total Scheduled, Ongoing, Completed, Delayed, Emergency, Available ORs, Occupied ORs, Avg Duration (min), OR Utilization Rate (%). Wraps to 4 columns on tablet, 2 on mobile. Strip recomputes against the Today/Weekly/Monthly toggle in the header.

### 4.4 Filter & Quick-Filter Bar
Row of `BooSelect`/`BooInput` controls: Operating Room, Department, Surgeon, Assistant Surgeon, Anesthesiologist, Patient/MRN, Surgery Type, Priority, Status, Emergency Level, Date. A secondary row of toggle chips for Quick Filters ("Today", "Emergency Only", "My Cases", "Delayed") plus a Saved Filters dropdown, same shape as Laboratory's filter bar.

### 4.5 Tab Bar
Same visual treatment as `AdminLaboratoryComponent`: icon + label, `role="tablist"`, bottom-border active indicator, horizontally scrollable on narrow viewports. Tabs: Dashboard, Schedule, Operating Rooms, Surgical Queue, Intra-Operative Tracking, Post-Operative Recovery, Clinical Alerts.

### 4.6 Tab Content
- **Dashboard:** 7 lightweight CSS-rendered visualizations (no new chart dependency, consistent with the "no npm install" build rule): OR Utilization (horizontal bar per room), Surgery Volume (bar, daily), Delay Rate (donut via conic-gradient), Emergency Cases (bar, daily), Procedure Distribution (horizontal bar/legend by category), Average Duration (bar, daily), Cancellation Rate (donut via conic-gradient).
- **Schedule:** view-mode toggle (Table / Timeline / Calendar).
  - *Table*: Surgery #, Patient, MRN, Procedure, Surgeon, OR, Scheduled Time, Est. Duration, Priority (badge), Status (badge). Search, filter, sort, pagination.
  - *Timeline*: per-room horizontal swimlane for the selected day; each surgery renders as a block positioned/sized by its scheduled start/duration, color-coded by status; overlapping blocks in the same room visually signal a conflict (red outline) — this is the lightweight, dependency-free stand-in for true drag-and-drop scheduling (see §12 for the upgrade path).
  - *Calendar*: surgeries grouped by day across the visible week, one compact chip per surgery (time + patient + room), clicking opens the drawer.
- **Operating Rooms:** card grid — Room Number, Room Type, Status (badge: Available/Preparing/Ready/InSurgery/Cleaning/Maintenance/Closed), Current Surgery (procedure, surgeon, patient), Start Time, Est. Finish Time, Equipment Ready indicator.
- **Surgical Queue:** list of today's pre-op cases ordered by scheduled time; each row shows patient, procedure, OR, current pre-op stage badge, and a checklist-completion fraction (e.g. "7/10"); expanding a row reveals the full Pre-operative Checklist with digital sign-off toggles.
- **Intra-Operative Tracking:** cards for rooms currently `InSurgery` — progress bar (elapsed / estimated duration), estimated remaining time, team roster with status, complications/blood-loss/implant-usage fields, free-text notes log.
- **Post-Operative Recovery:** list of cases in Recovery/PACU — PACU bay assignment, recovery status (badge), post-op notes, complications, follow-up orders; "Discharge from OR" action moves the case to `Discharged`.
- **Clinical Alerts:** full table — Severity (badge), Type, Description, Patient/Surgery reference, Suggested Action, Raised At; Acknowledge action. Identical shape to Laboratory's Critical Alerts tab.

### 4.7 Surgery Detail Drawer
Opened via `DrawerComponent` (width 760px), reused exactly as the Laboratory Patient Result Drawer does. Sections: Patient Summary (diagnosis, surgical history, allergies, lab results, radiology results, current medications, consent status, risk assessment), Surgical Team (role-labeled roster with replace/assign actions), Pre-operative Checklist (digital sign-off list), Equipment & Consumables (instrument sets, implants, consumables with availability/sterilization badges), Surgical Timeline (Scheduled → Patient Arrived → Pre-op Completed → Anesthesia Started → Surgery Started → Procedure Completed → Recovery → Discharged from OR, each with a timestamp), Notes. Quick Actions: View EMR, Print Consent, View Images, Open Treatment Sheet.

---

## 5. Component Hierarchy

```
paraclinical/surgery/
├── surgery.component.ts                          (AdminSurgeryComponent — shell: header, alerts
│                                                    banner, stats strip, filter bar, tabs)
├── surgery-detail-drawer.component.ts            (shared across tabs — opened by row "View")
└── tabs/
    ├── surgery-dashboard-tab.component.ts
    ├── surgery-schedule-tab.component.ts          (Table / Timeline / Calendar view modes)
    ├── surgery-operating-rooms-tab.component.ts
    ├── surgery-queue-tab.component.ts
    ├── surgery-intraop-tab.component.ts
    ├── surgery-postop-tab.component.ts
    └── surgery-alerts-tab.component.ts

shared/types/surgery.ts          (SurgeryCase, SurgeryRow, OperatingRoom, SurgicalTeamMember,
                                   EquipmentItem, PreOpChecklistItem, SurgeryTimelineEvent,
                                   SurgeryCriticalAlert, SurgeryStats, SurgeryDashboardTrend,
                                   SurgeryPatientSummary, SurgeryFilter, enums: SurgeryStatus,
                                   SurgeryPriority, OperatingRoomStatus, SurgicalTeamRole,
                                   EquipmentStatus, ChecklistItemStatus, SurgeryTimelineStage,
                                   SurgeryAlertType, SurgeryAlertSeverity)
services/admin/surgery.service.ts        (SurgeryService — mock-fallback pattern, same as
                                           LaboratoryService / TreatmentSheetService)
```

**Reused without modification:** `DrawerComponent`, `StatusBadgeComponent`, `StatCardComponent`, `EmptyStateComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `LocalLoadingService`, `ToastService`, `DialogService`.

**New (this feature):** everything under `paraclinical/surgery/` above, the drawer component, `surgery.ts` types (full rewrite of the existing 16-field `Surgery` interface), and `surgery.service.ts`.

**Not duplicated:** if a `Doctor`/`MedicalStaff` directory or a canonical OR/equipment inventory is introduced server-side, `SurgicalTeamMember` and `EquipmentItem` should resolve against it rather than duplicating staff/inventory records — see §12.

---

## 6. UI Specification & Interaction Design

- **Alert severity → tone:** Critical → danger, High → danger, Warning → warning, Information → primary. Identical mapping to Laboratory for visual consistency across paraclinical modules.
- **Surgery priority → tone:** Emergency → danger, Urgent → warning, Elective → neutral.
- **Room status → tone:** Available → success, Ready → success, Preparing → primary, InSurgery → warning, Cleaning → primary, Maintenance → danger, Closed → neutral.
- **Surgery status → tone:** Scheduled/PatientArrived → neutral, PreOpReady/AnesthesiaStarted → primary, InProgress → warning, ProcedureCompleted/Recovery → primary, Discharged → success, Delayed → danger, Cancelled → danger.
- **Checklist item status → tone:** Completed → success, Pending → warning, NotApplicable → neutral.
- **Equipment status → tone:** Available/Reserved → success, InUse → primary, Sterilizing → warning, Missing → danger.
- **Pre-op sign-off:** clicking a pending checklist item opens a lightweight inline confirm (signer name auto-filled from session) rather than a full dialog — fast enough for repeated use during a busy pre-op phase; "Timeout Verification" (last item) is the one exception that routes through `DialogService.confirm()` since it is the highest-stakes step (WHO Surgical Safety Checklist final timeout).
- **Cancel / discharge actions:** route through `DialogService.confirm()` requiring an implicit reason field, mirroring Laboratory's "Reject Sample" pattern.
- **Optimistic UI:** acknowledging a clinical alert, checking off a pre-op item, and advancing a timeline stage update local signal state immediately; a service error reverts and shows a toast.
- **Keyboard:** tab bar is arrow/Enter navigable; table rows, view-mode toggle, and checklist sign-off controls are fully tabbable.
- **View-mode toggle (Schedule tab):** plain 3-way segmented control (Table/Timeline/Calendar), state kept in a local signal, not persisted server-side in this iteration.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full multi-panel workspace: sticky header + alerts + stats strip + filter bar + horizontal tabs + full-width tables/room grid/timeline |
| Tablet (768–1279px) | Stats strip wraps to 4×3 (rounded to whole rows); filter bar collapses extra filters behind a "More Filters" popover; Operating Rooms grid drops to 2 columns; Schedule Timeline view scrolls horizontally; tab bar remains horizontal |
| Mobile (<768px) | Stats strip collapses to 2 columns; Schedule/Queue/Intra-Op/Post-Op/Alerts tables become stacked cards (one card per surgery/room/alert); Operating Rooms grid drops to 1 column; Dashboard charts stack to a single column; tab bar becomes a horizontally scrollable strip; Timeline/Calendar views fall back to Table view automatically below `md` (a swimlane or week grid is unusable at mobile width) |

---

## 8. Accessibility (WCAG 2.1 AA)

- All status/priority/severity badges pair color with text — never color alone.
- Clinical Alerts banner lives in an `aria-live="polite"` region so new critical alerts are announced.
- "Cancel Surgery" / "Discharge from OR" / "Timeout Verification" confirmations trap focus until resolved (reuses `DialogComponent`'s existing focus trap).
- Tab buttons use `role="tab"` / `aria-selected`, reachable and operable via keyboard only, with visible focus rings.
- Minimum 44×44px touch targets for all quick-action, checklist sign-off, and tab controls on tablet/mobile.
- Pre-operative checklist items have an associated `<label>`/`aria-label` naming the check (e.g. "Surgical Consent — signed") so screen readers announce status, not just a bare checkbox.
- The Schedule Timeline view (a visual swimlane) is supplemented by the Table view, which is the actual keyboard/screen-reader-operable surface — the Timeline is presentational, not the only way to read the schedule.

---

## 9. Page States

- **Loading (initial):** centered spinner + label while the header/stats/alerts payload loads, matching Laboratory's loading treatment.
- **Empty:** each tab shows `EmptyStateComponent` ("No surgeries match these filters", "No rooms configured", "Queue is empty", etc.) only after a successful load with zero results.
- **Error:** inline red banner with Retry button at the section level — never a blocking full-page error.
- **Success:** standard populated view.
- **Disabled:** action buttons disable + show inline spinner while their specific `LocalLoadingService` key is in flight; never a global page lock. Checklist sign-off controls disable while their save request is in flight.

---

## 10. Edge Cases & Exception Handling

- Two surgeries are scheduled in the same OR with overlapping times → the Schedule Timeline view renders both blocks with a red conflict outline and the Clinical Alerts banner raises an `OrConflict` alert; the Table view still lists both rows normally so nothing is hidden, only flagged.
- A pre-op checklist item is marked `NotApplicable` (e.g. "Implant Availability" for a non-implant case) → it is excluded from the completion fraction denominator so the queue's "x/y" indicator stays meaningful.
- A surgery is cancelled after pre-op checklist items were already signed off → the case moves to `Cancelled`, the OR reverts to `Cleaning`, and the signed checklist history is preserved (not deleted) for audit purposes.
- A critical/missing-consent alert arrives while the page is open → surfaces only through the Clinical Alerts banner once the alerts endpoint reports it; no intrusive modal (avoids alert fatigue, consistent with Laboratory's handling).
- An operating room is set to `Maintenance` while a surgery is still scheduled against it → triggers an `OrConflict`-type alert prompting reassignment rather than silently leaving the case unscheduled.
- No surgeries match the active filter combination → empty state offers a one-click "Clear Filters" action rather than a dead end.
- A surgery's actual duration exceeds its estimated duration while `InProgress` → Intra-Operative Tracking shows the progress bar capped at 100% with an "Overrunning" indicator instead of overflowing the bar, and the case is counted toward the dashboard's Delay Rate.

---

## 11. Performance Considerations

- Header/stats/alerts load via a single `forkJoin` on entry (mirrors `AdminLaboratoryComponent.load`); each tab's own data loads lazily on first activation, not as one giant payload.
- Schedule/Queue/Intra-Op/Post-Op/Alerts tables use `trackBy` (`id`) to avoid full re-renders on optimistic updates.
- All list-returning endpoints are designed against the existing `PaginationData<T>` contract so server-side pagination works without a type change once the backend lands; client-side filtering is a stopgap over the mock data only.
- Dashboard trend visualizations and the Schedule Timeline view are pure CSS (no charting/calendar library), keeping the module dependency-free and avoiding the "no npm install" build constraint.
- The Operating Rooms grid and Intra-Operative Tracking cards poll-refresh only while their tab is active (lazy activation), not in the background, to avoid unnecessary requests from idle tabs.

---

## 12. Scalability & Enterprise Recommendations

- Keep `SurgeryService` on the same mock-fallback pattern as `LaboratoryService`/`TreatmentSheetService` so backend cutover requires zero caller changes.
- Model `SurgeryRow`, `OperatingRoom`, `SurgicalTeamMember`, `EquipmentItem`, `PreOpChecklistItem`, and `SurgeryCriticalAlert` as first-class types now (not `any`) so downstream features (billing triggers, OR cost accounting, accreditation reporting) can be layered in without a type rewrite.
- The Schedule tab's Timeline view is a deliberately lightweight, dependency-free stand-in for true drag-and-drop scheduling. If/when a calendar/scheduling library is approved for installation, it should replace only the Timeline view's rendering — the underlying `SurgeryRow`/`OperatingRoom` data contract does not need to change.
- `SurgicalTeamMember.staffId` and `EquipmentItem.equipmentId` are modeled as plain string identifiers now so they can be wired to a canonical staff directory / inventory system later without a type change once those systems exist in this codebase.
- Quick Filters and Saved Filters are modeled as plain client-side state for now (per the mock-fallback approach); the API contract already includes a saved-filter endpoint (§13) so persistence can be added without a UI rewrite.
- Conflict detection (overlapping OR bookings) is computed client-side over the currently loaded schedule for now; a production system should also enforce it server-side on the create/reschedule endpoints (§13, #7) to avoid races between concurrent OR coordinators.

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping via existing auth middleware (not repeated per row). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Get dashboard stats | GET | `/api/surgery/stats?range=today\|week\|month` | query params | `SurgeryStats` | Stats strip |
| 2 | Get dashboard trends | GET | `/api/surgery/trends?range=today\|week\|month` | query params | `SurgeryDashboardTrend` | Dashboard tab charts |
| 3 | Get active clinical alerts | GET | `/api/surgery/alerts` | — | `SurgeryCriticalAlert[]` | Alerts banner + Clinical Alerts tab |
| 4 | Acknowledge an alert | POST | `/api/surgery/alerts/{alertId}/acknowledge` | `{ note?: string }` | `string` (id) | Alert chip/row dismiss |
| 5 | Search surgery schedule | GET | `/api/surgery/cases/search` | `PagedRequest<SurgeryFilter>` | `PaginationData<SurgeryRow>` | Schedule tab (Table/Timeline/Calendar) |
| 6 | Get surgery case detail | GET | `/api/surgery/cases/{surgeryId}` | — | `SurgeryCase` | Surgery Detail Drawer |
| 7 | Schedule / reschedule a surgery | POST/PATCH | `/api/surgery/cases` / `/api/surgery/cases/{surgeryId}` | `{ patientId, procedure, operatingRoomId, scheduledStart, estimatedDurationMinutes, priority, ... }` | `SurgeryRow` | "Schedule Surgery" action, Schedule tab reassignment |
| 8 | Cancel a surgery | POST | `/api/surgery/cases/{surgeryId}/cancel` | `{ reason: string }` | `SurgeryRow` | Schedule/Queue row "Cancel" |
| 9 | List operating rooms | GET | `/api/surgery/rooms` | — | `OperatingRoom[]` | Operating Rooms tab |
| 10 | Update room status | PATCH | `/api/surgery/rooms/{roomId}/status` | `{ status: OperatingRoomStatus }` | `OperatingRoom` | Operating Rooms tab action |
| 11 | Get pre-operative checklist | GET | `/api/surgery/cases/{surgeryId}/checklist` | — | `PreOpChecklistItem[]` | Surgical Queue row expand / Drawer |
| 12 | Update a checklist item | PATCH | `/api/surgery/cases/{surgeryId}/checklist/{itemId}` | `{ status: ChecklistItemStatus, signedBy: string }` | `PreOpChecklistItem` | Checklist sign-off |
| 13 | Get surgical team | GET | `/api/surgery/cases/{surgeryId}/team` | — | `SurgicalTeamMember[]` | Drawer — Surgical Team section |
| 14 | Assign / replace a team member | PATCH | `/api/surgery/cases/{surgeryId}/team/{memberId}` | `{ staffId: string, role: SurgicalTeamRole }` | `SurgicalTeamMember` | Drawer — Assign/Replace action |
| 15 | Get equipment & consumables | GET | `/api/surgery/cases/{surgeryId}/equipment` | — | `EquipmentItem[]` | Drawer — Equipment section |
| 16 | Reserve / replace equipment | PATCH | `/api/surgery/cases/{surgeryId}/equipment/{itemId}` | `{ status: EquipmentStatus, quantity?: number }` | `EquipmentItem` | Drawer — Reserve/Replace action |
| 17 | Advance surgical timeline stage | POST | `/api/surgery/cases/{surgeryId}/timeline/{stage}` | `{ occurredAt?: string }` | `SurgeryTimelineEvent[]` | Drawer Timeline, Intra-Op "Mark Stage" |
| 18 | Update intra-operative tracking | PATCH | `/api/surgery/cases/{surgeryId}/intraop` | `{ notes?, complications?, bloodLossMl?, estimatedRemainingMinutes? }` | `SurgeryCase` | Intra-Operative Tracking tab |
| 19 | Update post-operative recovery | PATCH | `/api/surgery/cases/{surgeryId}/postop` | `{ pacuBay?, recoveryStatus?, postOpNotes?, complications?, followUpOrders? }` | `SurgeryCase` | Post-Operative Recovery tab |
| 20 | Discharge from OR/PACU | POST | `/api/surgery/cases/{surgeryId}/discharge` | `{ }` | `SurgeryRow` | Post-Operative Recovery "Discharge" action |
| 21 | Get patient surgical summary (drawer) | GET | `/api/surgery/patients/{patientId}/summary` | — | `SurgeryPatientSummary` | Surgery Detail Drawer — Patient Summary |
| 22 | Print consent form | GET | `/api/surgery/cases/{surgeryId}/consent/print` | — | binary (`application/pdf`) | Drawer — "Print Consent" quick action |
| 23 | List saved filters | GET | `/api/surgery/saved-filters` | — | `SavedView[]` | Filter bar "Saved Filters" |
| 24 | Save a new filter view | POST | `/api/surgery/saved-filters` | `{ name: string, filter: SurgeryFilter }` | `SavedView` | Filter bar "Save current filter" |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/surgery-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/surgery.ts` (rewritten)
- [x] Service: `src/app/services/admin/surgery.service.ts` (mock-fallback)
- [x] `SURGERY` block in `src/app/shared/api/base.ts`
- [x] Route kept at `/admin/paraclinical/surgery`
- [x] Components: shell + 7 tabs (Dashboard, Schedule, Operating Rooms, Surgical Queue, Intra-Operative Tracking, Post-Operative Recovery, Clinical Alerts) + Surgery Detail Drawer
