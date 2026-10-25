# Doctor Desk redesign (`/admin/clinic/doctor-desk`)

Status: implemented in `physio-app/src/app/pages/admin/clinic/doctor-desk/`.

## UX audit and current problems (before this change)
- **The queue never showed anyone.** The page filtered on `status === 'waiting'`, but the snapshot API returns the
  lower-cased appointment status (`checkedin`, `inprogress`, `completed`).
- **The "current patient" lived only in browser memory.** Starting a consultation set a local signal; a reload or the
  30 s poll lost it, even though the server had already moved the visit to `InProgress`.
- **The completion form was never rendered.** `showCompleteModal` was set, but no template used it.
- **Fake actions.** "Transfer" only edited local state, "Print prescription" only showed a success toast.
- **Fabricated data on screen.** The shift ("Morning Shift") and the online dot are hard-coded by the server; the
  consultation timer ran off the browser clock because the API returns no start time.
- **Error handling.** A failed poll toasted every 30 s; an empty response called `history.back()`; every poll replaced
  the page with a spinner; no retry, no 403 or "no doctor profile" state.
- **Non-shared controls.** `boo-button-admin` with inline colours instead of the shared button.
- Doctor notes were collected but the server's `Appointment.Complete()` discards them.

## Information architecture
One screen, three zones, ordered by what the doctor does next:
1. **With you** (in consultation) - patient identity, complaint, vitals, allergies, actions.
2. **Waiting** - checked-in patients, urgent first, then by check-in time.
3. **Completed today** - read-only list.
A header strip shows the doctor, department, room and today's date, with Refresh and a "last updated" stamp. Four counts:
waiting, with you, completed, urgent.

## User journey
1. Open page -> snapshot loads (skeleton).
2. Press **Call** on a waiting patient -> `InProgress`; the visit moves into "With you".
3. Review identity, complaint, latest vitals and allergies; optionally open the full medical record.
4. **Complete consultation** -> drawer: diagnosis (required), treatment plan, follow-up date -> `Completed`.
5. The visit moves to "Completed today".

## Layout and wireframe
```
Breadcrumb
Doctor desk                                   [Updated 09:41 · auto-refreshes] [Refresh]
Dr. Name · Department · Room 3 · Wed, 21 Oct
[Waiting 4] [With you 1] [Completed 7] [Urgent 1]
+------------------------------------------+  +-----------------------+
| WITH YOU                                 |  | WAITING (4)           |
|  A012  Name  [Urgent]  34 y · Female     |  |  A015 Name   09:12 [Call]
|  Chief complaint ............            |  |  A016 Name   09:20 [Call]
|  Vitals | Allergies                      |  +-----------------------+
|  [Complete consultation] [Medical record]|  | COMPLETED TODAY (7)   |
+------------------------------------------+  +-----------------------+
```

## Component hierarchy
```
AdminDoctorDeskComponent            state, polling, permissions, actions
├─ StatCardComponent (existing)     counts
├─ ConsultationPanelComponent       one card per InProgress visit
├─ WaitingQueuePanelComponent       waiting list + Call
├─ CompletedListComponent           completed list
└─ CompleteConsultationDrawerComponent   form (drawer)
```
Removed: `desk-header` (fake shift/online/clock).

## UI specification
Shared `@physioboo/ui`: `boo-button`, `boo-status-badge`, `boo-empty-state`, `boo-error-state`,
`boo-inline-error`, `physio-icon`. App-level shared controls: `boo-textarea`,
`boo-datepicker`, `drawer`, `DialogService`, `admin-breadcrumb`, `boo-stat-card`. No native select or date input.
(`@physioboo/ui` exports no select, date picker, textarea or drawer; the app-level ones are used, as on Booking/Queue.)

## Interaction design
- **Call** is disabled while a request for that visit is running (no double submit). It is also disabled when the user
  lacks `scheduling:appointment:update`; the button is then hidden.
- **Complete** needs `scheduling:encounter:complete`; otherwise hidden. The drawer validates inline, keeps the typed
  text if the request fails, asks before discarding edits, and blocks close while submitting.
- Polling every 30 s only while the tab is visible and nothing is being submitted. A failed refresh keeps the old data
  and shows an inline retry banner.

## Page states
| State | Treatment |
|---|---|
| First load | skeleton blocks |
| 403 | error state: no access to the doctor desk |
| 404 | error state: account has no doctor profile |
| Other failure | error state with Retry |
| Refresh failure | inline error above the content, data kept |
| No visits today | empty state |
| Nobody waiting / nobody in consultation | per-panel empty state |

## Responsive, accessibility, performance
- One column below `lg`, two columns (2/3 + 1/3) above. No fixed heights; the page scrolls, lists do not nest scrolls.
- Real `<button>`s with visible focus rings, `aria-busy` on loading, `aria-live` on the refresh stamp, drawer is
  `role="dialog"`, labelled, and focus moves to the diagnosis field on open.
- A queue is a single-day, single-doctor list; no pagination is needed. Lists are `trackBy` keyed.

## Edge cases
- Several visits `InProgress` (e.g. started on two screens): all are shown under "With you"; Call is disabled until
  they are finished.
- Visit changed by someone else between poll and click: the server answer wins, the list reloads after every action.
- Allergies/vitals missing: explicit "No known allergies" / "No vitals recorded" text, never invented values.
- Patient age/gender/name are the only identity fields shown; no phone, address or insurance.

## Scalability / enterprise recommendations
See "Backend limitations" below; the main follow-ups are a server-side start time, a real queue number and persisted
doctor notes.

## Proposed and used API contract
| Purpose | Call | Permission | Used |
|---|---|---|---|
| Today's visits for the signed-in doctor | `GET /api/doctor-desk/snapshot` | `clinical:doctor-desk:read` | yes |
| Start consultation | `PATCH /api/appointments/{id}/status` `{status: 3}` (InProgress) | `scheduling:appointment:update` | yes |
| Complete consultation | `PATCH /api/appointments/{id}/complete` `{diagnosis, treatmentPlan, followUpDate}` | `scheduling:encounter:complete` | yes |
| Full chart | page `/admin/clinic/medical-record?patientId=` | `clinical:medical-record:read` | link |

## Backend limitations (not worked around)
- `Complete()` ignores `doctorNotes` and `actualDurationMinutes`, so the form does not offer a notes field.
- No consultation start time is returned, so no elapsed timer is shown.
- Snapshot `Shift` and `IsOnline` are constants on the server; they are not displayed.
- `PATCH status` / `complete` do not check the visit's current status or that it belongs to the caller.
- No endpoint to transfer, cancel a call or print a prescription from this page; those buttons were removed.
- Route and menu are guarded by `clinical:medical-record:read`, but the snapshot API needs
  `clinical:doctor-desk:read`; a user with only the first permission sees the 403 state.
- Diagnoses are a single free-text string on the appointment; there are no coded (ICD) diagnoses or clinical notes
  write endpoints.
