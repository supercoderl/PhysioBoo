# Super Admin — Tenants Redesign

**Paths:** `/superadmin/tenants/hospital-group`, `/superadmin/tenants/hospital-group/:id` (new)
**Parent doc:** `superadmin-redesign.md` (§3.1 — Tenants is build step 1).
**Audience:** the platform owner only (see parent §0). Tenants never see these pages.

A *tenant* is a **Hospital Group**; a **Hospital** is a branch of a tenant (and the unit that carries `TenantId` on clinical data).

> **Scope decision (2026-10-11):** the Super Admin controls **tenants only**. Hospitals are created, edited and deleted by each tenant in its own `/admin` area, so there is **no Hospitals page in Super Admin**. The tenant detail shows a tenant's hospitals **read-only** (needed to compare branch count with the plan limit).

---

## 1. UX Audit — Current State

Both pages are borrowed from `admin/system/common-category` and wrapped in the admin content header.

| Finding | Evidence |
|---|---|
| Raw enum numbers shown to the user | Hospital `type` renders `0…6`; group `subscriptionPlan` renders `0…3` |
| Name column in `text-danger` (red) | Reads as an error; inconsistent with Users / Roles |
| Search, sort, filter, date range are declared but **not in the template** | `filter_configs`, `sort_options`, `onSearch`, `onSortChange`… are dead code |
| Table never shows a loading state | `loadingSrv.isLoading('search')` — the search requests carry no loading key |
| No statistics, no detail view | A tenant can only be edited through a drawer; its hospitals, plan and invoices are not visible |
| Only action is **Delete** | Edit is hidden behind clicking the red name |
| Page size 5, optimistic delete with manual rollback | Over-engineered, easy to desync totals |
| Two sources of truth for the plan | Drawer edits `HospitalGroup.subscriptionPlan` (legacy enum) while Billing manages `TenantSubscription` (plan entity) |

## 2. Current Problems (to fix)

1. A tenant has no "home" page: nothing shows plan, subscription state, hospitals or usage together.
2. List pages lack search / filter / sort / stats / loading / error states.
3. Presentation bugs (raw enums, red names).
4. Plan shown from the legacy enum, not from Billing.

## 3. Information Architecture

```
Hospital Groups  (list)
├── Stats: Total · Active · Inactive
├── Table: Tenant · Contact · Hospitals · Plan · Status · Created · Actions
└── Tenant detail  /hospital-group/:id
    ├── Header: logo/initial · name · code · status · Edit · Delete · Manage billing
    ├── Stats: Hospitals · Plan · Branch usage · Outstanding
    └── Tabs: Overview · Hospitals (read-only) · Subscription
```

## 4. User Journey

Owner opens **Hospital Groups** → scans stats → searches / filters → clicks a tenant → **Tenant detail** shows who they are, which hospitals they run, what plan they are on and whether they owe money → edits details in a drawer, or jumps to Billing to change the plan.

## 5. Layout

List pages follow the shared pattern (parent §6): page header → stat strip → table card. The detail page:

```
← Hospital groups
┌ [logo] Name  CODE  ● Active  ● Subscription            [Edit][Delete] ┐
└────────────────────────────────────────────────────────────────────────┘
[Hospitals] [Plan] [Branch usage] [Outstanding]
[ Overview | Hospitals | Subscription ]
┌ tab panel ─────────────────────────────────────────────────────────────┐
```

## 6. Component Hierarchy

```
SuperadminTenantListComponent (page)
├── SuperadminPageHeaderComponent · StatCardComponent
├── SuperadminTenantTableCardComponent        (NEW — boo-table-admin + columns)
└── CommonCategoryHospitalGroupDrawerComponent (reused)

SuperadminTenantDetailComponent (page, NEW)
├── StatCardComponent · StatusBadgeComponent · EmptyStateComponent · ErrorStateComponent
└── CommonCategoryHospitalGroupDrawerComponent (reused)
```

Services: `HospitalGroupService.getStats()` (placeholder, see §12), `HospitalService.searchByGroup()` (read-only branch list), existing `BillingService` for the subscription tab. Types: `TenantStats`. Utilities: `HOSPITAL_TYPE_LABELS`, `SUBSCRIPTION_PLAN_LABELS`, `shared/utils/billing.utils.ts` (status tone / label / money).

## 7. UI Specification

Tokens only (parent §8). Name cell = `text-primary font-medium`, code `text-secondary text-xs`. Status via `boo-status-badge` (dot + text, never colour alone). Numbers `tabular-nums`. Avatar: logo image or initial on `bg-primary/10`. Branch-usage bar turns `danger` only when the tenant is **over** its plan limit.

## 8. Interaction Design

- Row name button / "View" → detail page. "Edit" → drawer. "Delete" → `DialogService.confirmDelete`, then reload (no optimistic rollback).
- Search is debounced by `boo-input`; sort and filter apply server-side and reset to page 1.
- Tabs follow the ARIA tabs pattern (`role=tablist/tab/tabpanel`, arrow keys, `aria-selected`).
- Drawer save → close → reload list/stats (or detail).

## 9. Responsive Behaviour

Stat strip: 1 → 2 → 4 columns. Table scrolls inside its card. Detail header actions wrap below the title under 640px; tab list scrolls horizontally if needed.

## 10. Accessibility

Name cell is a real `<button>` with `aria-label`; tabs per ARIA authoring practices; progress bar uses `role="progressbar"` with `aria-valuenow/max`; every status carries text; focus rings on all controls; loading regions `aria-busy`.

## 11. Page States

| State | List | Detail |
|---|---|---|
| Loading | table loading skeleton, stat skeletons | header + stat skeletons |
| Empty | table empty message | Hospitals tab: "No hospitals yet"; Subscription tab: "No subscription" |
| Error | `boo-error-state` + Retry (list) | full-page error + Retry; tab data failures degrade to "—" |
| Not found | — | "Tenant not found" with link back |
| Success | toast + reload | toast + reload |

## 12. Proposed API Contract (propose only — not implemented)

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Tenant stats | GET | `/api/hospital-groups/stats` | — | `{ total, active, inactive }` | list stat strip |
| Tenant detail (one call) | GET | `/api/hospital-groups/{id}/detail` | — | group + hospitals + subscription + usage `{ users, maxUsers, branches, maxBranches }` | detail page (replaces 3–4 calls) |
| Suspend / reactivate | POST | `/api/hospital-groups/{id}/suspend` · `/reactivate` | `{ reason }` | `{ success }` | detail header (future) |

**Interim (placeholder) behaviour:** stats come from single-row searches (`pageSize: 1`, read `totalCount`); the detail page composes existing endpoints: `hospital-groups/{id}`, `hospitals/search` filtered by `hospitalGroupId`, `billing/subscriptions/{id}`, `billing/plans`. Seat (user) usage is **not shown** until the usage endpoint exists.

## 13. Edge Cases

- Tenant without subscription → plan "No plan", status badge "No plan", Subscription tab empty state with link to Billing.
- Plan without a branch limit → usage shows `n / ∞`, no bar.
- Hospital group deleted while its detail is open → "Tenant not found".
- Legacy plan enum value outside the known range → show the raw value rather than crash.
- Navigating between two tenants reuses the component (route param observed, not read once).

## 14. Performance

Server-side paging (20/page), debounced search, detail loads its four requests in parallel and degrades per request, tab panels render lazily (`*ngIf`).

## 15. Scalability

Table cards are plain `boo-table-admin` consumers, so Master Data / Security lists can copy the same shape. Detail tabs are data-driven, so a "Users" or "Activity" tab can be added later without restructuring.

## 16. Enterprise Recommendations

- Single source of truth for the plan: Billing (`TenantSubscription`). Retire the `HospitalGroup.subscriptionPlan` enum field and its drawer dropdown once the backend allows; until then the list shows it as a read-only label.
- Suspend/reactivate with mandatory reason + audit entry rather than delete.
- Show seat usage vs plan limit (needs the detail endpoint).

## 17. Implementation Status

| Item | Status |
|---|---|
| Hospital Groups list (stats, search/filter/sort, states) | Done |
| Tenant detail page (header, stats, 3 tabs) | Done |
| Hospitals list in Super Admin | **Removed** — hospitals are tenant-controlled in `/admin` |
| Routes switched from admin pages to Super Admin pages | Done |
| Enum labels (hospital type, plan) | Done |
| Tenant invitations & onboarding queue | Planned |
| Suspend / reactivate, seat usage | Blocked on API (§12) |
