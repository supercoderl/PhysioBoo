# HIS Mobile App — Redesign & Implementation Spec

**Scope of this document:** Sub-project 1 of the HIS Mobile App — **Foundation + Guest + Patient**.
Staff, Manager, and Super Admin mobile experiences are separate sub-projects, each to get their own
`docs/mobile-<role>-redesign.md` once this foundation ships.

## 0. Premise

The Mobile App is the mobile version of the existing HIS system, not a separate product. The existing
Web app (`physio-app`) and backend (`physio-server`) are the source of truth for business rules, roles,
permissions, auth, API contracts, domain models, and workflows. This document does not invent new
business rules — where a capability the mobile UX needs has no backend support today, that gap is
called out explicitly in §9 (API Analysis) rather than assumed.

---

## 1. UX Audit — Current State

| Area | Current state on Web | Implication for Mobile |
|---|---|---|
| Guest pages | `pages/client/*` — Home, Doctor list, Hospitals, Blog, About, Contact, Term, Privacy. Desktop marketing layout (carousels, wide hero, nav bar). | Full functional parity, redesigned as mobile-first cards/lists + bottom tabs. |
| Auth | `pages/auth/*` — login, register, OAuth (Google/Facebook), forgot/reset password, verification. `AuthService` handles session, token refresh (cookie-based JWT), profile, permissions. | Reuse `AuthService`'s API-facing methods as-is; rebuild the forms only. |
| Patient self-service | **Does not exist.** `authGuardFn` explicitly redirects any user whose only role is `PATIENT` to `/exception/403`. `PATIENT` is a real, publicly-registerable backend role (`RoleMetadata(..., isPublicForRegistration: true)`), but no default permissions are seeded for it, and every patient-data endpoint (`PatientEndpoints`, `AppointmentEndpoints`, `MedicalRecordEndpoints`, `PrescriptionEndpoints`, lab/imaging report endpoints) is gated by *staff* permission strings (e.g. `Reception.PatientRead`, `Scheduling.AppointmentRead`) that a patient account does not hold. | Mobile is the **first** patient-facing surface. Where an endpoint needs staff permissions, the mobile client cannot get real data today — this is documented as a proposed API gap (§9), not built with a duplicate business layer. Screens are still built end-to-end with clear placeholder/error states so the feature is functionally complete the moment the backend gap is closed. |
| Staff/Manager/Admin | `pages/admin/*`, `pages/superadmin/*` — dense desktop tables/drawers. | Out of scope for this sub-project. |

---

## 2. Current Problems

1. No mobile-optimized surface at all — the web app is desktop-first (SSR Angular + ng-zorro tables/drawers) and unusable on a phone for either guests or patients.
2. Patients who register (backend already allows it) hit a dead end — no home screen, no way to see appointments/records, immediate 403 if they try admin routes.
3. Guest content (doctors, hospitals, articles) is desktop-only; a prospective patient on a phone gets a cramped desktop layout, not a native-feeling browse experience.

---

## 3. Information Architecture

```
Guest (unauthenticated)
├── Home
├── Doctors (list → detail)
├── Hospitals/Departments (list → detail)
├── News/Blog (list → detail)
└── More → About, Contact, Terms, Privacy, Login/Register

Patient (authenticated, PATIENT role)
├── Home (quick actions, upcoming appointment summary)
├── Appointments (list → detail; book new)
├── Records
│   ├── Medical history
│   ├── Prescriptions
│   └── Lab / Imaging results
└── Profile
    ├── Personal info (edit)
    ├── Billing history
    └── Settings / Logout
```

Role resolution reuses the same `role$` stream `AuthService.getProfile()` already populates from
`GET /api/users/me` — no new auth concept.

---

## 4. User Journey (Patient, primary journey)

1. Guest browses Doctors/Hospitals unauthenticated → taps "Book an appointment" → prompted to log in/register.
2. Register (`PATIENT` role, public registration already supported by backend) or log in.
3. Lands on Patient Home — sees next appointment (if any) and quick actions.
4. Views Appointments tab — list, pull-to-refresh, tap into detail.
5. Views Records tab — history/prescriptions/results, each a simple list → detail.
6. Edits Profile, views billing history, or logs out.

Where step 4–6 hit the current permission gap (§1), the screen renders its real empty/error state
("Not available yet — ask reception" style messaging) rather than fake data.

---

## 5. Layout & Navigation

- Ionic `ion-tabs` bottom navigation, 4–5 tabs, role-aware tab set built at bootstrap from `role$`.
- Guest tab bar swaps to Patient tab bar immediately after login without a full app reload (tabs are a
  computed signal off `AuthService.role$`).
- Detail views push as stacked pages (`ion-nav`/router-outlet per tab), not new tabs.
- Actions that don't warrant a full page (e.g. "book appointment" quick form, filters) use Ionic
  modals/action sheets/bottom sheets instead of desktop drawers.

## 6. Wireframes (textual)

```
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ ≡ PhysioBoo    🔍 │   │ ‹ Doctors          │   │ ‹ Dr. Nguyen       │
│                   │   │ [search........]   │   │  photo  ★4.8      │
│  [Hero banner]    │   │ [Specialty ▾]      │   │  Cardiology        │
│  Book now →        │   │ ┌───────────────┐ │   │  Bio text...       │
│                   │   │ │ 👤 Dr. A  Cardio│ │   │  Schedule:         │
│  Quick: Doctors    │   │ │ 👤 Dr. B  Ortho │ │   │  Mon 08:00-12:00   │
│  Hospitals  News   │   │ └───────────────┘ │   │  [Book appointment]│
├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ 🏠  👨‍⚕️  🏥  📰  ⋯  │   │ (tabs)             │   │ (back stack)       │
└───────────────────┘   └───────────────────┘   └───────────────────┘

Patient Home            Appointments             Records
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ Hi, Minh Quang      │   │ Upcoming | Past    │   │ History | Rx | Labs│
│ Next appt:          │   │ ┌───────────────┐ │   │ ┌───────────────┐ │
│  Wed 10:00 Dr. A     │   │ │ Wed 10:00 A   │ │   │ │ Visit 12/08   │ │
│  [Details]           │   │ │ Sched. Cardio │ │   │ │ Dx: ...        │ │
│ Quick: Book, Records │   │ └───────────────┘ │   │ └───────────────┘ │
├───────────────────┤   │  [+ Book]          │   │                    │
│ 🏠  📅  📋  👤       │   ├───────────────────┤   ├───────────────────┤
└───────────────────┘   │ 🏠  📅  📋  👤       │   │ 🏠  📅  📋  👤       │
                         └───────────────────┘   └───────────────────┘
```

## 7. Component Hierarchy

```
AppComponent
├── AuthShellComponent (guest, unauthenticated router-outlet)
│   ├── TabsComponent (guest tabs)
│   │   ├── HomePage
│   │   ├── DoctorListPage → DoctorDetailPage
│   │   ├── FacilityListPage → FacilityDetailPage
│   │   ├── NewsListPage → NewsDetailPage
│   │   └── MorePage → AboutPage / ContactPage / TermPage / PrivacyPage
│   └── LoginPage / RegisterPage / ForgotPasswordPage / ResetPasswordPage
└── PatientShellComponent (authenticated, PATIENT role)
    └── TabsComponent (patient tabs)
        ├── PatientHomePage
        ├── AppointmentListPage → AppointmentDetailPage / BookAppointmentModal
        ├── RecordsPage (segment: History / Prescriptions / Results)
        └── ProfilePage → EditProfilePage / BillingHistoryPage
```

Shared, reused as-is (adapted only for imports/paths):
`AuthService`, HTTP interceptors (auth/refresh/loading/error), `PermissionService`/guard logic,
`shared/models`, `shared/enums` (incl. `Role`), `shared/api` endpoint constants, domain-facing
services with no desktop coupling (`DoctorService`, `HospitalService`, `DepartmentService`,
`AppointmentService`, `PatientService`, `MedicalRecordService`, `PrescriptionService`), pure utilities
(`shared/utils`, `shared/validator`, `shared/pipes` where framework-agnostic).

Rebuilt for mobile (desktop-coupled, not reused): all `components/layout/admin/*`, table/drawer
components, `MenuService`'s admin-sidebar caching, `ThemeConfigService`'s desktop theming (mobile gets
its own minimal theme service if needed).

---

## 8. UI Specification, Interaction, Responsive, Accessibility, States

- **UI kit:** Ionic components (`ion-card`, `ion-list`, `ion-item`, `ion-segment`, `ion-modal`,
  `ion-action-sheet`, `ion-skeleton-text`) — no ng-zorro (desktop-oriented) in the mobile app.
- **Touch targets:** minimum 44×44pt per Ionic/HIG defaults; list rows use `ion-item button`.
- **Responsive:** phone-first (360–430px logical width baseline), tablet breakpoint adjusts list/detail
  to a split view where Ionic's `ion-split-pane` fits naturally (Patient Records, Doctors).
- **Accessibility:** semantic Ionic elements (already ARIA-aware), min contrast per WCAG AA on any
  custom colors, focus order preserved through router transitions, form fields keep visible labels
  (no placeholder-only labels).
- **States per screen:** loading (Ionic skeletons, keyed the same way `LoadingKeys`/loading interceptor
  already tags requests), empty (illustration + CTA), error (retry action), success, disabled
  (e.g. "Book appointment" disabled while a request for that doctor's slots is in flight).
- **Edge cases:** expired/invalid token → interceptor triggers the same refresh-then-retry flow as web;
  on refresh failure, redirect to Login. Patient-data 403 (see §1 gap) → explicit "not available yet"
  state, not a generic error. No network → offline banner, cached last-successful data shown read-only
  where feasible (`Records`, `Home`).

## 9. API Analysis (proposals only — no backend changes made in this sub-project)

Per instruction, **no existing backend API, business rule, role, permission, or contract is modified**.
Everything below reuses existing endpoints as-is. The one open gap is documented for a future decision,
not implemented:

| Endpoint used by Mobile | Method | Status |
|---|---|---|
| `/api/users/login`, `/oauth-login`, `/register`, `/refresh/refresh-token`, `/forgot-password`, `/users/me` | existing | reused unchanged |
| `/api/doctors/search`, `/api/hospitals/search`, `/api/departments/search`, `/api/articles/search`, `/api/medical-specialties/search` | existing | reused unchanged (guest, no auth) |
| `/api/patients/{id}`, `/api/appointments/*`, `/api/medical-records/{patientId}/*`, `/api/prescriptions/*`, lab/imaging report reads | existing | **staff-permission gated** — a `PATIENT`-role user has no seeded permissions and will receive 403. Mobile screens call these as designed for a future self-scoped variant; until then they render the "not available yet" empty state described in §8. |

**Proposed future API change (not built now, requires a product decision + backend work of its own):**
add self-scoped read authorization (e.g. "patient may read where `PatientId == currentUser.PatientId`")
to the existing appointment/medical-record/prescription/lab/imaging query handlers, or a thin `/me`
query variant reusing the same handler. This is a permissions/authorization decision for the backend
owner, out of scope here.

---

## 10. Performance, Scalability, Enterprise Recommendations

- Route-level lazy loading per tab/page (mirrors web's `loadComponent`/`loadChildren` pattern).
- Debounced search on Doctor/Facility/News lists (reuse existing debounce utility if present in
  `shared/utils`, else a small rxjs `debounceTime` pipe — no new abstraction beyond that).
- Paginated lists (`ion-infinite-scroll`) instead of desktop pagination controls, backed by the same
  `PagedRequest`/`PagedResponse` contracts already used by web.
- Memoize the role→tabset computation; do not recompute on every navigation.
- Capacitor-ready from day one so the same codebase ships to iOS/Android later without rework.

---

## 11. Project Setup

- New folder: `physio-mobile/` (sibling to `physio-app`, `physio-server`), Ionic 8 + Angular 17
  standalone app, Capacitor scaffolded but not required to build/run day one (works as mobile web
  first).
- No shared library/monorepo extraction in this sub-project — code is ported file-by-file from
  `physio-app` where reusable, adapted where it had desktop coupling, per §7.
- No changes made to `physio-app` or `physio-server`.
