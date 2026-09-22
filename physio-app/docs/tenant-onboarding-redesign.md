# Tenant Onboarding — Redesign

## 0. Summary

Add a new self-service **Tenant Bootstrap** flow: a "holder" (company owner) registers their
`HospitalGroup` (the company) together with at least one `Hospital` (a branch), in a single
submission, and gets an owner account for the new tenant out of it. This is Flow A of the
two-flow tenant-onboarding design agreed on in `prescription-redesign.md`'s sibling conversation —
Flow B (invite-based signup for everyone who joins an *existing* tenant: staff, doctors, patients)
is intentionally **out of scope for this doc** and will get its own pass once Flow A ships, per
"start at smallest."

This directly closes the two most severe bugs found in the multi-tenancy audit: self-registered/
OAuth users currently save with `TenantId = Guid.Empty` because `/api/users/register` has no tenant
context to attach to a new user at all. Flow A gives that context a real, correct source for the
one case where a *new* tenant is being created.

## 1. UX Audit — Current State

**File:** `src/app/pages/auth/register/register.component.ts`

- Single flat form: email, phone, password. No company/hospital fields anywhere.
- `role: Role.DOCTOR` is **hardcoded** into every registration payload (line 55) — every person
  who signs up today becomes a Doctor, regardless of who they actually are. There is no concept
  of "the person registering owns the tenant."
- Posts to `BASE_API.REGISTER` → backend `CreateUserCommandHandler`/`UserProvisioningService`,
  neither of which ever calls `.SetTenantId(...)` — confirmed via code read, this is the root
  cause of the `TenantId = Guid.Empty` bug.
- No hospital/company creation exists anywhere in the frontend today. `HospitalGroup`/`Hospital`
  creation (`CreateHospitalGroupCommand`/`CreateHospitalCommand`) exist on the backend but are
  admin-only, authenticated-only endpoints with no frontend page calling them at all — there is
  currently no UI anywhere in the app for creating a company or a branch.
- On success, navigates to `/auth/verify-required` — this part is reusable for Flow A unchanged.

## 2. Current Problems

| # | Problem | Impact |
|---|---|---|
| 1 | No tenant context collected at registration | Every self-registered user gets `TenantId = Guid.Empty`, permanently invisible to tenant-scoped queries |
| 2 | Hardcoded `Role.DOCTOR` | A company owner registering has no way to become anything but a Doctor |
| 3 | No company/branch creation UI | `CreateHospitalGroupCommand`/`CreateHospitalCommand` exist server-side with zero frontend entry point |
| 4 | No relationship between "who's registering" and "what they're registering" | Can't distinguish "I'm starting a new company" from "I'm joining one" — needed for Flow A vs. Flow B to coexist later |

## 3. Information Architecture

```
Tenant Onboarding (Flow A only — Flow B is a separate future doc)
└── Register Company  (route: auth/register-tenant, replaces or sits alongside today's /auth/register)
    ├── Step 1 — Company Details     — HospitalGroup: Name, Description, Headquarters Address,
    │                                   Website, Phone, Email, Logo, Established Date, License Number
    ├── Step 2 — Branch(es)          — repeatable Hospital block (min 1): Name, Type, Address,
    │                                   City/State/Country, Phone, Email — "+ Add another branch"
    ├── Step 3 — Owner Account       — the holder's own login: Email, Phone, Password, Confirm
    └── Submit → creates HospitalGroup + Hospital(s) + owner User atomically → verify-required
```

Kept as a **3-step wizard**, not one long form — each step maps 1:1 to one new entity being
created, which keeps the submission payload legible and gives natural validation boundaries
(don't let the user reach Step 3 with an invalid Step 1/2).

## 4. User Journey

1. A prospective company owner lands on **Register Company** (distinct entry point from the
   existing doctor/staff `/auth/register`, which should be relabeled or gated behind Flow B
   once that exists — for now it can stay as-is, unrelated to this flow).
2. **Step 1**: enters company details. Client-side validation only (required fields, formats) —
   no server round-trip yet, nothing is created until final submit.
3. **Step 2**: adds at least one branch. "+ Add another branch" repeats the block; each branch
   has its own mini-form. Minimum 1 enforced client-side (submit disabled with 0 branches) and
   server-side (reject an empty branch array).
4. **Step 3**: sets up their own login (email/phone/password) — this becomes the tenant's first
   Owner account.
5. Submits → single `POST` to the new bootstrap endpoint (§12) → backend creates HospitalGroup +
   Hospital(s) + User in one transaction (reusing the `BeginTransactionAsync`/`CommitTransactionAsync`
   infra already added for `CreatePrescriptionCommandHandler`/`CheckoutCartCommandHandler` — same
   pattern applies here: partial failure must not leave an orphaned company with no owner).
6. On success → same `verify-required` redirect the existing register flow already uses (reuse,
   don't rebuild).
7. After verifying, the owner logs in normally — their JWT now carries a real `TenantId`
   (the new `HospitalGroup.Id`), closing the `Guid.Empty` bug for this path entirely.

## 5. Layout

Centered card wizard, consistent with the existing `auth.component.ts` shell (same shell every
other `/auth/*` page already uses — reuse `FormWrapperComponent`, `BooInputComponent`,
`BooButtonComponent`, don't introduce a new form-field system for this one page).

```
┌─────────────────────────────────────────┐
│  Step indicator: ① Company ─ ② Branches ─ ③ Owner  │
│                                           │
│  [ Step content — one boo-form per step ]│
│                                           │
│  [ Back ]                    [ Next / Create Company ] │
└─────────────────────────────────────────┘
```

## 6. Component Hierarchy

```
RegisterTenantComponent (route: auth/register-tenant)
├── TenantStepIndicator          — 3-dot/label progress, reusable if other wizards appear later
├── CompanyDetailsStepComponent  — Step 1 form
├── BranchListStepComponent      — Step 2, wraps N × BranchFormComponent
│   └── BranchFormComponent      — one branch's fields + remove button (disabled when count === 1)
└── OwnerAccountStepComponent    — Step 3 form (reuses existing register form fields/validators)
```

## 7. Interaction Design

- Step transitions are client-side only (no partial saves) — nothing is created server-side until
  the final Step 3 submit. This matters: unlike an autosave draft pattern (used elsewhere in this
  app, e.g. prescriptions), a half-finished tenant registration should not exist as a database row
  — there is no "resume later" for this flow in v1.
- "Add another branch" appends a new `BranchFormComponent` instance; "Remove" only appears when
  more than one branch exists (the minimum-1 constraint must be visibly enforced, not just
  validated on submit).
- Final submit button disabled while any step's form is invalid, and while the request is in
  flight (use `LocalLoadingService`, the same pattern `register.component.ts` and every other
  admin form in this app already uses — don't add a second loading-state mechanism).

## 8. Page States

- **Idle** — default wizard state.
- **Validating** — inline field errors per step, standard `boo-input` error display.
- **Submitting** — final submit button shows a spinner, all fields disabled, back navigation
  disabled (don't let the user change Step 1 while Step 3's request is in flight).
- **Success** — redirect to `verify-required` (no separate success screen needed, matches
  existing register flow).
- **Error** — server-side validation failure (e.g. duplicate email, duplicate hospital license
  number) surfaces via `ToastService` (existing pattern) and returns the user to the step whose
  field caused it, not just a generic top-level error banner — the error response needs to be
  specific enough to identify which step's field failed (see §12 response shape).

## 9. Edge Cases

- **Duplicate owner email** — same `DUPLICATE_EMAIL`-style error code pattern already used
  elsewhere (`CommandHandlerBase.CommitAsync`'s Postgres-constraint mapping) — reuse it, surface
  on Step 3.
- **Partial backend failure** — company created, branch insert fails: the transaction must roll
  back all three inserts, not leave a company with zero branches or zero owner. This is the
  primary reason this endpoint must be transactional from day one, not retrofitted later.
- **Browser refresh mid-wizard** — since nothing is persisted until final submit, a refresh simply
  loses in-progress form state, same as any other multi-step form in this app with no autosave.
  Acceptable for v1; explicitly not building session-storage draft recovery unless asked.
- **Two people racing to register the same company name** — company name is not necessarily
  unique (real hospital chains can share generic names); only email/hospital-license-number should
  be enforced unique, not company name — confirm this against whatever uniqueness constraints
  already exist on `HospitalGroup`/`Hospital` before assuming either way.

## 10. Accessibility

Standard form accessibility already established by `boo-input`/`boo-form` across the app: label
association, error announcement, focus management on step change (focus should move to the new
step's first field, not stay on the now-hidden "Next" button), and keyboard-only completability
(Tab through fields, Enter submits the current step, not the whole wizard, until Step 3).

## 11. Scalability / Enterprise Considerations

- This is a low-traffic, high-stakes endpoint (company registration, not a hot path) — no special
  pagination/virtualization/debounce concerns apply here, unlike the pharmacy modules.
- Rate-limit or CAPTCHA-gate this endpoint before production if it's public-facing — creating a
  `HospitalGroup` is a meaningfully heavier write than a normal user registration and a spam target
  worth considering, even though it's out of scope to implement in this pass.

---

## 12. Backend API Contract (proposed — not implemented)

### 12.1 `POST /api/tenants/register` (new, anonymous)

- **Purpose**: atomically create a `HospitalGroup`, ≥1 `Hospital` under it, and the first `User`
  (Owner role) for that tenant.
- **Request**:
  ```
  {
    company: { name, description?, headquartersAddress?, website?, phone?, email?, logoUrl?, establishedDate?, licenseNumber? },
    branches: [ { name, hospitalType, address, city, stateProvince, country, phone?, email? }, ... ]  // min 1
    owner: { email, phone, password }
  }
  ```
- **Handler behavior**: `BeginTransactionAsync` → insert `HospitalGroup` (no `SetTenantId`, it's
  the root) → insert each `Hospital` with `SetTenantId(newHospitalGroup.Id)` (reuse
  `CreateHospitalCommandHandler`'s exact pattern) → insert `User` with
  `SetTenantId(newHospitalGroup.Id)` and an Owner/Admin role assignment (reuse whatever
  `AssignRoleToUser` already does, don't invent a second role-assignment path) → on any failure,
  `RollbackTransactionAsync` and return which step failed → `CommitTransactionAsync` on full
  success.
- **Response**: `PagedResponse<{ hospitalGroupId, hospitalIds[], userId }>`, or a structured
  validation error identifying which of `company`/`branches[i]`/`owner` failed, so the frontend
  can route the user back to the correct wizard step.
- **Frontend usage**: `TenantOnboardingService.registerTenant(payload)` from
  `RegisterTenantComponent`'s final submit.
- **Note on reuse vs. new code**: this handler is structurally almost identical to
  `CreateHospitalGroupCommandHandler` + `CreateHospitalCommandHandler` + `CreateUserCommandHandler`
  run in sequence inside one transaction — the domain construction logic (the `new HospitalGroup(...)`,
  `new Hospital(...)`, `new User(...)` calls) should be reused from those existing handlers'
  patterns directly, not reimplemented. The only genuinely new code is the transaction wrapping
  and the three-part request/response shape.

### 12.2 Out of scope for this doc

Flow B (invite-based signup for staff/doctors/patients joining an *existing* tenant), the
Option-C `ApplicationDbContext.OnTrackingTenant` hardening, and any changes to the existing
`/auth/register` (Doctor-only) page are deliberately not covered here — each gets its own pass
once Flow A is live and proven.
