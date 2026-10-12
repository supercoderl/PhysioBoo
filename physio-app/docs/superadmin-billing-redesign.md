# Super Admin — Plans & Billing Redesign

**Path:** `/superadmin/billing` (`src/app/pages/superadmin/billing`, `src/app/components/layout/superadmin/billing`)
**Parent doc:** `superadmin-redesign.md` (§3.1, build step 1). **Related:** `superadmin-tenants-redesign.md`.
**Audience:** the platform owner only. Payments are recorded manually — no card data is collected.

---

## 1. UX Audit — Current State

| Finding | Evidence |
|---|---|
| KPIs are wrong at scale | "Monthly recurring (this page)" and "Outstanding" summed the 20 rows on screen; "Past due" counted the page |
| Everything on one scroll | Plans, plan editor, tenant table and a 420px aside stacked in one page; below `xl` the aside drops under the table, off-screen |
| Plan editor inline, unstyled | Native inputs with `border-gray-300`, labels as text, no validation messages, no unsaved-change protection |
| Table not keyboard accessible | `<tr (click)>`; no row action, no focus ring |
| Hand-built pager and filters | prev/next buttons, `<select>` and search outside the shared table pattern |
| No states | no loading skeleton, no error state, empty text only for the table |
| Inconsistent chrome | own title block, admin breadcrumb chip, `rounded-xl`, `text-brandDark` for every level |
| Currency hard-coded to `USD` in KPIs | mixed-currency plans would add up incorrectly |
| Actions fire without busy state | double-click can submit twice |

## 2. Current Problems (to fix)

1. Accurate platform-wide KPIs.
2. A focused workflow: find a tenant → manage its subscription, without losing the list.
3. Plans managed in a proper form with validation.
4. Shared patterns: page header, stat cards, table card, drawers, tabs, badges, states.
5. Accessibility and responsive behaviour.

## 3. Information Architecture

```
Plans & billing
├── Header                         [New plan]
├── Stats: Tenants · Monthly recurring · Past due · Outstanding invoices
└── Tabs
    ├── Subscriptions   search + status filter + table → row opens Subscription drawer
    └── Plans           plan cards → Edit opens Plan drawer

Subscription drawer (per tenant)         Plan drawer
├── Overview (status, outstanding,       ├── Code (immutable) · Name · Description
│   since, period, trial)                ├── Monthly price · Currency
├── Plan (select + Subscribe/Change/     ├── Max users · Max branches (empty = unlimited)
│   Activate/Mark past due/Cancel)       └── Sort order · Offered to tenants
├── Billing details (email, notes)
└── Invoices (bill period · mark paid · void)
```

Deep link: `/superadmin/billing?tenant=<hospitalGroupId>` opens that tenant's drawer (linked from the tenant detail page).

## 4. User Journey

Owner opens Billing → checks stats (past due? outstanding?) → filters Subscriptions by *Past due* → opens a tenant → marks the invoice paid with a reference (or changes plan / cancels with confirmation) → drawer stays open, list and stats refresh behind it. Creating or editing a plan happens in its own drawer from the Plans tab or the header button.

## 5. Layout

```
[Plans & billing]                                          [+ New plan]
[Tenants] [Monthly recurring] [Past due] [Outstanding]
[ Subscriptions (n) | Plans (n) ]
┌ search · status filter · reload ──────────────────────────────────────┐
│ Tenant · Plan · Status · Period · Outstanding · Actions                │
└────────────────────────────────────────────────────────────────────────┘
                                         ┌ Drawer 520px (full width on mobile)
```

## 6. Component Hierarchy

```
BillingComponent (page)
├── SuperadminPageHeaderComponent · StatCardComponent
├── SuperadminTabsComponent                 (NEW, shared with tenant detail)
├── SuperadminSubscriptionTableCardComponent (NEW — boo-table-admin consumer)
├── SuperadminTenantSubscriptionDrawerComponent (NEW)
└── SuperadminPlanDrawerComponent            (NEW)
```
Reused: `boo-table-admin`, `drawer`, `boo-status-badge`, `boo-empty-state`, `boo-error-state`, `DialogService`, `ToastService`. Utilities: `shared/utils/billing.utils.ts` (tone / label / money). Service: `BillingService.getSummary()` (placeholder).

## 7. UI Specification

Tokens only (parent §8). Status via `boo-status-badge` (Active/Paid = success, Trial = primary, PastDue/Open = warning, Cancelled/Void = danger, None = neutral). Money and dates use `tabular-nums`. Outstanding amounts use the warning tone only when > 0. Primary action is single: **New plan**; in the drawer, **Subscribe / Change plan** is the only filled button; Activate / Mark past due / Cancel are outlined with their status colour.

## 8. Interaction Design

- Tenant name button or "Manage subscription" action → drawer; "View tenant" action → tenant detail.
- **Cancel** and **Mark past due** require confirmation; **Void invoice** requires confirmation.
- Buttons disable while a request is running (no double submit); success shows a toast; the list, stats and plan subscriber counts refresh.
- Plan form validates on blur (errors under fields); Save disabled while saving; closing a dirty form asks for confirmation when dismissed via the overlay.

## 9. Responsive Behaviour

Stats 1 → 2 → 4 columns. Table scrolls inside its card. Drawers use `min(520px, viewport width)`. Plan cards 1 → 2 → 3 columns.

## 10. Accessibility

ARIA tabs with arrow/Home/End keys; drawers are `role="dialog" aria-modal` with a labelled title and a close button; every form control has a visible `<label for>`; invoice reference inputs have `aria-label`; status never colour-only; focus rings on all controls; skeletons `aria-busy`.

## 11. Page States

| State | Subscriptions | Plans | Drawer |
|---|---|---|---|
| Loading | table loading state | 3 card skeletons | 3 block skeletons |
| Empty | table empty message | "No plans yet" | "No invoices yet" |
| Error | error state + Retry | error state + Retry | error state + Retry |
| Busy | — | — | action buttons disabled |

## 12. Proposed API Contract (propose only — not implemented)

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Billing summary | GET | `/api/billing/summary` | — | `{ tenants, monthlyRecurring: [{currency, amount}], pastDue, outstanding: [{currency, amount}], activeTrials }` | stat strip (replaces first-page sum) |
| Cross-tenant invoices | POST | `/api/billing/invoices/search` | paged + `{ status, from, to, tenantId }` | paged `SubscriptionInvoice` (+ tenant name) | future "Invoices" tab |
| Sort subscriptions | GET | `/api/billing/subscriptions?sort=` | `sort` | paged | sortable table |

**Interim (placeholder) behaviour:** `getSummary()` sums the first 100 tenants of `GET /api/billing/subscriptions`; when more tenants exist the stat label reads "(first 100)". All amounts are formatted as USD until the summary endpoint returns per-currency totals.

## 13. Edge Cases

- More than 100 tenants → summary flagged partial.
- Mixed currencies → totals shown in USD only until the API groups by currency (open issue).
- Tenant with no subscription (`None`) → drawer offers **Subscribe**; billing-detail and invoice sections adapt.
- Plan hidden (`isActive = false`) → still shown (dashed, "Hidden") and still listed for tenants already on it, but not offered in the plan select.
- Opening `?tenant=` for an unknown id → the drawer shows its error state; closing it clears the query parameter.
- Dismissing the plan drawer with unsaved edits asks for confirmation.

## 14. Performance

Stats, plans and the first table page load in parallel; per-section failure does not block the others; the drawer loads its detail on open only.

## 15. Scalability

Add an **Invoices** tab (cross-tenant search) and per-currency stat cards without restructuring; the drawer is reusable from the tenant detail page.

## 16. Enterprise Recommendations

- Idempotent "mark paid" and invoice numbering owned by the server (already so).
- Audit every billing write (`Sys_AuditLog`).
- Dunning: scheduled past-due marking + reminder emails (backend).
- Export invoices (CSV/PDF).

## 17. Implementation Status

| Item | Status |
|---|---|
| Page shell, header, accurate stats (placeholder aggregate) | Done |
| Subscriptions tab (search, status filter, paging, states) | Done |
| Plans tab (cards, states) | Done |
| Subscription drawer (plan, status actions with confirmations, details, invoices) | Done |
| Plan drawer (validated form) | Done |
| Shared `superadmin-tabs`, deep link `?tenant=` | Done |
| Summary endpoint, per-currency totals, invoices tab | Blocked on API (§12) |
