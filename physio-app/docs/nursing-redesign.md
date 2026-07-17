# Nursing Module Redesign — Enterprise NIS (Nursing Information System) Specification

**Path:** `admin/nursing`
**Current implementation:** None. Only `Ward`/`Bed` types and the Inpatient Bed Map exist (`src/app/pages/admin/inpatient/bed-map`). There is no nursing workflow surface — no task list, MAR, vitals charting, I&O, nursing notes, or shift handover.
**Scope:** Frontend UI/UX only. No backend, no DB schema. Reuses existing conventions: `DrawerComponent`, `StatusBadgeComponent`, `BooIcon`, `BooSelect`, `BooInput`, `BooTextarea`, `LocalLoadingService`, `ToastService`, `DialogService`, Tailwind, Angular signals. Mirrors the tabbed-chart pattern already established in `medical-record` and the dashboard/stat-card pattern from `inpatient/bed-map`.

---

## 1. UX Audit — Current State

| Area | Current Implementation | Problem |
|---|---|---|
| Ward overview | Bed Map shows bed occupancy only | No nurse-relevant view: who is assigned to which patients, no acuity/risk at a glance |
| Patient list | None for nursing | A nurse covering 20–40 patients has no single screen listing her assignment with status |
| Tasks | None | No due/overdue task tracking (meds, vitals rounds, dressing changes) — the core of a shift |
| Medication administration | `Medication` type exists (prescription-side) but no administration record | No MAR — nurses can't confirm/document what was actually given, when, by whom |
| Vital signs | `Vitals` type is a single static snapshot (no timestamp, no trend) | Can't chart vitals over time or flag abnormal trends |
| Intake & Output | Not modeled at all | I&O balance is mandatory for renal/cardiac/post-op patients — completely missing |
| Nursing notes | `Note` type exists with `type: 'nursing'` but no UI surface | Notes have no structured entry point, no chronological timeline |
| Shift handover | None | No SBAR-style handover; nurses currently hand over verbally with no audit trail |
| Alerts/risk | None | Fall risk, isolation, allergy, and emergency flags exist nowhere in the nursing UI |
| Bed/patient context | Only available a click away in Bed Map | Nursing work is patient-centric, not bed-centric — needs its own assignment view |

**Root cause:** nursing work was never modeled as a workflow surface — only the administrative bed inventory (Bed Map) exists. An enterprise NIS needs a shift-based, task-driven, patient-centric workspace.

---

## 2. Information Architecture

```
Nursing Module (/admin/nursing)
├── Nursing Dashboard (/admin/nursing/dashboard)            ← default
│   ├── Sticky Header (shift selector, ward filter, refresh, search)
│   ├── Statistics Strip (assigned patients, open tasks, overdue tasks, active alerts)
│   ├── Clinical Alerts Banner (fall risk / isolation / emergency / critical vitals)
│   ├── Filters Row (ward, status, risk flags, task state)
│   ├── My Patients Table (acuity, bed, risk badges, next task, last vitals, MAR due)
│   └── Patient Chart Drawer (quick-access overlay; "Open full chart" → patient route)
├── Patient Nursing Chart (/admin/nursing/patient/:id)
│   ├── Patient Context Header (identity, bed/ward, risk badges, allergies)
│   ├── Tab: Overview        (snapshot: vitals trend, open tasks, active alerts, I&O balance)
│   ├── Tab: Vitals          (chart + table, add reading)
│   ├── Tab: MAR             (medication administration record, due/given/missed)
│   ├── Tab: Intake & Output (fluid balance log, running totals)
│   ├── Tab: Tasks           (nursing task list for this patient)
│   └── Tab: Notes           (nursing notes timeline, add note)
└── Shift Handover (/admin/nursing/handover)
    ├── Outgoing/Incoming shift selector
    ├── Per-patient SBAR handover cards (Situation, Background, Assessment, Recommendation)
    └── Acknowledge handover action
```

**Key IA decision:** the Dashboard is bed/ward-agnostic and patient-centric — a nurse's unit of work is "my assigned patients," not "this ward's beds." The existing Bed Map remains the source of truth for bed/room occupancy; Nursing Dashboard links to it rather than duplicating it.

---

## 3. User Journey

1. Nurse logs in, opens **Nursing → Dashboard**, selects current shift (Day/Evening/Night) and ward.
2. Dashboard loads assigned patients with acuity, risk badges, and next-due task highlighted.
3. Clinical Alerts banner surfaces anything critical (fall risk unaddressed, isolation breach risk, abnormal vitals) — nurse triages these first.
4. Nurse clicks a patient row → Patient Chart Drawer opens for a quick glance, or "Open full chart" for the full tabbed view.
5. In the chart, nurse records a vitals reading (Vitals tab), marks a medication as given (MAR tab), logs fluid intake (I&O tab), completes a task (Tasks tab), or writes a note (Notes tab).
6. Dashboard task counts and alert banner update immediately (optimistic update, no full reload).
7. At end of shift, nurse opens **Shift Handover**, reviews/edits SBAR cards generated from the day's notes/tasks/alerts, and submits handover to the incoming shift.
8. Incoming nurse opens Handover, reviews outgoing notes per patient, acknowledges, and the cycle restarts on the new Dashboard session.

---

## 4. Layout & Wireframes

### 4.1 Nursing Dashboard — Sticky Header
- `position: sticky; top: 0`, contains: page title, Shift `BooSelect` (Day/Evening/Night), Ward `BooSelect`, `BooSearch` (patient name/bed), Refresh icon-button.
- Collapses search + filters into a single row below ~1024px.

### 4.2 Statistics Strip
4 `StatisticCard`-style tiles (reusing the stat-card pattern from `bed-map.component.ts`): **Assigned Patients**, **Open Tasks**, **Overdue Tasks** (red accent), **Active Alerts** (amber/red accent).

### 4.3 Clinical Alerts Banner
- Horizontally scrollable row of alert chips, sorted by severity (Critical → High → Medium).
- Each chip: icon (fall/isolation/emergency/vital), patient name, bed, one-line reason, dismiss/acknowledge action.
- Hidden entirely when there are zero active alerts (no empty placeholder banner).

### 4.4 Filters Row
`BooSelect` × (Ward, Risk Flag: Fall Risk / Isolation / Emergency, Task State: Overdue / Due Soon / All) + `BooSearch`. Filters are client-side against the loaded assignment snapshot, same pattern as Bed Map.

### 4.5 My Patients Table
Built on `BooTableAdminComponent`. Columns:
| Column | Content |
|---|---|
| Patient | Avatar + name + patient number |
| Bed | Ward · bed number (links to Bed Map context) |
| Risk | Stacked `StatusBadge` chips: Fall Risk, Isolation, Emergency, Allergy |
| Acuity | Low/Medium/High/Critical badge |
| Next Task | Task label + due time, red if overdue |
| MAR Due | Count of medications due in next hour |
| Last Vitals | Time since last recorded vitals, amber if >4h stale |
| Actions | Open chart, Quick vitals entry, Quick task complete |

Row click opens the **Patient Chart Drawer** (480px) with Overview snapshot + "Open full chart" link to the dedicated route.

### 4.6 Patient Nursing Chart (full route, tabbed — mirrors `medical-record` tab architecture)
- **Patient Context Header** (sticky): avatar, name, age/gender, bed/ward, primary doctor, risk badge row (Fall Risk, Isolation, Emergency, Allergies), "Back to Dashboard" link.
- **Tabs:** Overview · Vitals · MAR · Intake & Output · Tasks · Notes — same tab-bar visual treatment as Medical Record (icon + label + optional count badge).
- **Overview tab:** vitals mini-trend (last 6 readings), open task list (top 5), active alerts, I&O balance summary (last 24h).
- **Vitals tab:** reading history table (time, BP, HR, Temp, RR, SpO2, recorded by) + "Add Reading" action opening an inline form/drawer; abnormal values highlighted inline (no separate alert needed if covered elsewhere).
- **MAR tab:** table of scheduled doses (medication, dose, route, scheduled time, status: Due/Given/Missed/Held, given-by/given-at) with one-tap "Mark Given" / "Mark Missed" actions gated by confirmation dialog for Missed/Held.
- **Intake & Output tab:** two side-by-side logs (Intake: oral/IV/other; Output: urine/drain/other) with running 24h balance total, "Add Entry" action.
- **Tasks tab:** checklist-style list grouped by Overdue / Due Soon / Upcoming / Completed, one-tap complete, due time, assigned nurse.
- **Notes tab:** reverse-chronological timeline (reusing the `Note` type, `type: 'nursing'`), "Add Note" textarea with submit, author + timestamp per entry.

### 4.7 Shift Handover
- Shift selector (Outgoing shift → Incoming shift).
- Per-patient SBAR card: Situation (one-line status), Background (admission reason, key history), Assessment (current concerns, open alerts), Recommendation (what incoming nurse should watch/do).
- Each card pre-populated from the day's notes/tasks/alerts where possible (editable free text, never silently auto-submitted).
- "Acknowledge All" / per-card "Acknowledge" action records handover sign-off.

---

## 5. Component Hierarchy

```
nursing/
├── dashboard/
│   └── nursing-dashboard.component.ts          (AdminNursingDashboardComponent)
├── patient/
│   ├── nursing-patient.component.ts             (AdminNursingPatientComponent — tab shell, signals state)
│   └── tabs/
│       ├── nursing-overview-tab.component.ts
│       ├── nursing-vitals-tab.component.ts
│       ├── nursing-mar-tab.component.ts
│       ├── nursing-io-tab.component.ts
│       ├── nursing-tasks-tab.component.ts
│       └── nursing-notes-tab.component.ts
└── handover/
    └── nursing-handover.component.ts             (AdminNursingHandoverComponent)

components/layout/admin/nursing/
└── nursing-alert-banner.component.ts             (reusable; could be reused on a future physician dashboard)

shared/types/nursing.ts                            (NursingPatient, NursingTask, MarEntry, IntakeOutputEntry,
                                                     VitalsReading, NursingAlert, ShiftHandoverCard, enums)
services/admin/nursing.service.ts                  (NursingService — mock-fallback pattern, same as MedicalRecordService)
```

**Reused without modification:** `DrawerComponent`, `StatusBadgeComponent`, `BooIconComponent`, `BooSelectComponent`, `BooInputComponent`, `BooTextareaComponent`, `BooSearchComponent`, `BooTableAdminComponent`, `BooAvatarComponent`, `LocalLoadingService`, `ToastService`, `DialogService`.

**New (this feature):** everything under `nursing/` above, plus `nursing.ts` types and `nursing.service.ts`.

---

## 6. UI Specification & Interaction Design

- **Risk badges** use `StatusBadgeComponent` with `dotted` variant: Fall Risk → warning, Isolation → primary, Emergency → danger, Allergy → danger.
- **Task urgency:** Overdue = danger/red text + icon; Due within 30 min = warning/amber; otherwise neutral.
- **MAR actions** ("Mark Given") are single-click for the common path; "Mark Missed"/"Held" routes through `DialogService.confirm()` requiring a reason (reuses the `Note`-style free text already supported elsewhere).
- **Optimistic UI:** marking a task complete or a MAR dose given updates local signal state immediately; on service error, the row reverts and a toast explains the failure (same approach as `confirmDischarge` in Bed Map).
- **Keyboard:** table rows are focusable and openable via Enter; tab bar is arrow-key navigable (same as Medical Record tabs).
- **Auto-refresh:** Dashboard polls task/alert counts on a light interval (placeholder only — actual interval wiring deferred to backend availability) and always supports manual Refresh.

---

## 7. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop (≥1280px) | Full table view; chart tabs as horizontal bar; drawer at 480px |
| Tablet (768–1279px) | Stats strip wraps to 2×2; table scrolls horizontally; tabs remain horizontal but icon-only with tooltip |
| Mobile (<768px) | Patient list becomes stacked cards (avatar, name, bed, risk badges, next task) instead of table; chart tabs become a bottom sheet selector; drawer becomes full-screen |

---

## 8. Accessibility (WCAG 2.1 AA)

- All risk/status badges pair color with an icon and text label — never color alone.
- Alert banner items are in an `aria-live="polite"` region so new critical alerts are announced.
- MAR "Mark Missed/Held" confirmation traps focus until resolved (reusing `DialogComponent`'s existing focus trap).
- Table rows and tab buttons have visible focus rings and are reachable via keyboard only.
- Minimum 44×44px touch targets for all task/MAR quick actions on tablet/mobile.

---

## 9. Page States

- **Loading (initial):** centered spinner + label, matches Bed Map's `bed-map-snapshot` loading treatment.
- **Empty:** "No patients assigned for this shift" with icon, shown only after a successful load with zero results.
- **Error:** inline red banner with Retry button (matches Bed Map's error treatment) — never a blocking full-page error.
- **Success:** standard populated view.
- **Disabled:** quick-action buttons disable + show inline spinner while their specific mutation (`LocalLoadingService` key) is in flight, never a global page lock.

---

## 10. Edge Cases & Exception Handling

- Patient discharged mid-shift while open in chart → chart shows a dismissible "Patient discharged" banner, disables further entry, keeps data read-only.
- Two nurses mark the same MAR dose simultaneously → second submit fails gracefully with "already recorded by {nurse}" toast (handled client-side as a service error path; real conflict resolution is a backend concern).
- Vitals reading with an out-of-range value → inline highlight only, not a blocking dialog (avoids alert fatigue); aggregation into the Alerts banner happens server-side once that endpoint exists.
- No active shift selected → Dashboard shows a prompt to select shift before loading patient list (no default silently assumed).
- Handover submitted with empty Recommendation field → soft warning, not a hard block (nurses must be able to hand over quickly in emergencies).

---

## 11. Performance Considerations

- Patient list and table rows use `trackBy` (`patient.id`) to avoid full re-renders on optimistic updates.
- Vitals/MAR/I&O history tables are paginated via the existing `PaginationData<T>` contract, not loaded in full.
- Tab content is lazy — each tab component fetches its own data only when first activated (mirrors `medical-record` tab lazy-loading via `forkJoin` per tab, not one giant payload).
- Alert banner and stats strip are intentionally cheap (counts only) so the Dashboard's perceived load time stays low even with hundreds of patients hospital-wide; the nurse's own assignment is the only full list fetched.

---

## 12. Scalability & Enterprise Recommendations

- Keep `NursingService` on the same mock-fallback pattern as `MedicalRecordService` so backend cutover requires zero caller changes.
- Model `NursingTask`, `MarEntry`, and `IntakeOutputEntry` as first-class types now (not generic `any`) so CDS-style rules (e.g., overdue thresholds) can be layered in later without a type rewrite.
- Reuse `Note` (`type: 'nursing'`) rather than inventing a parallel note model — Notes tab and any future physician-facing timeline can share one feed.
- Shift Handover SBAR cards should be generated server-side from structured task/note/alert data once available, with the frontend only rendering + allowing edits — avoids divergence between what was actually done and what's handed over.
- Patient Nursing Chart route (`/admin/nursing/patient/:id`) is intentionally separate from `/admin/clinic/medical-record` — nursing and physician views serve different workflows even though they share the same patient and some underlying data (vitals, notes).

---

## 13. Proposed Backend API Contract

All endpoints assume hospital/tenant scoping is applied via existing auth middleware (not repeated per-endpoint below). Response envelope follows the existing `PagedResponse<T>` / `PaginationData<T>` shape used across the app.

| # | Purpose | Method | URL | Request | Response | Frontend Usage |
|---|---|---|---|---|---|---|
| 1 | Get nurse's assigned patients for a shift | GET | `/api/nursing/assignments?shift=Day&wardId=` | query params | `NursingPatient[]` | Dashboard table |
| 2 | Get dashboard stats | GET | `/api/nursing/stats?shift=Day` | query params | `NursingStats` | Stats strip |
| 3 | Get active clinical alerts | GET | `/api/nursing/alerts?shift=Day` | query params | `NursingAlert[]` | Alerts banner |
| 4 | Acknowledge/dismiss an alert | POST | `/api/nursing/alerts/{alertId}/acknowledge` | `{ note?: string }` | `string` (id) | Alert chip dismiss |
| 5 | Get patient nursing context | GET | `/api/nursing/patients/{patientId}` | — | `NursingPatient` | Chart header |
| 6 | Get vitals history | GET | `/api/nursing/patients/{patientId}/vitals` | paged query | `PaginationData<VitalsReading>` | Vitals tab |
| 7 | Record a vitals reading | POST | `/api/nursing/patients/{patientId}/vitals` | `VitalsReading` (no id) | `VitalsReading` | Vitals "Add Reading" |
| 8 | Get MAR for patient | GET | `/api/nursing/patients/{patientId}/mar` | paged query | `PaginationData<MarEntry>` | MAR tab |
| 9 | Update MAR entry status | PATCH | `/api/nursing/mar/{marEntryId}` | `{ status: 'Given'\|'Missed'\|'Held', reason?: string }` | `MarEntry` | "Mark Given/Missed/Held" |
| 10 | Get intake & output log | GET | `/api/nursing/patients/{patientId}/io` | paged query | `PaginationData<IntakeOutputEntry>` | I&O tab |
| 11 | Add intake/output entry | POST | `/api/nursing/patients/{patientId}/io` | `IntakeOutputEntry` (no id) | `IntakeOutputEntry` | I&O "Add Entry" |
| 12 | Get tasks for patient | GET | `/api/nursing/patients/{patientId}/tasks` | paged query | `PaginationData<NursingTask>` | Tasks tab |
| 13 | Update task status | PATCH | `/api/nursing/tasks/{taskId}` | `{ status: 'Completed'\|'Cancelled' }` | `NursingTask` | Task quick-complete |
| 14 | Get nursing notes for patient | GET | `/api/nursing/patients/{patientId}/notes` | paged query | `PaginationData<Note>` | Notes tab |
| 15 | Add nursing note | POST | `/api/nursing/patients/{patientId}/notes` | `{ content: string }` | `Note` | Notes "Add Note" |
| 16 | Get shift handover cards | GET | `/api/nursing/handover?outgoingShift=Day&wardId=` | query params | `ShiftHandoverCard[]` | Handover page |
| 17 | Submit/acknowledge handover card | POST | `/api/nursing/handover/{cardId}/acknowledge` | `{ acknowledgedBy: string }` | `ShiftHandoverCard` | Handover acknowledge |

---

## 14. Deliverables Checklist

- [x] Documentation (`docs/nursing-redesign.md`)
- [x] Proposed API contract (§13)
- [x] Types: `src/app/shared/types/nursing.ts`
- [x] Service: `src/app/services/admin/nursing.service.ts` (mock-fallback)
- [x] `NURSING` block in `src/app/shared/api/base.ts`
- [x] Routes: `/admin/nursing/dashboard`, `/admin/nursing/patient/:id`, `/admin/nursing/handover`
- [x] Components: Dashboard, Patient Chart (+ 6 tabs), Handover
