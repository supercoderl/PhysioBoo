# Super Admin Module — Redesign

**Path:** `/superadmin/**` (`src/app/pages/superadmin`, `src/app/components/layout/superadmin`)
**Scope:** Rebuild the platform-owner console on the existing design language (tokens, `boo-*` shared components) so it matches the admin panel, is driven by the database menu, and covers every platform concern (tenants, billing, access control, security, platform settings).

Related docs: `superadmin-role-list-redesign.md`, `tenant-onboarding-redesign.md`.

---

## 0. Audience & Ownership

The Super Admin module is the **platform owner's own control plane**. It is operated only by the owner who designs and runs the system — never by tenants. Tenants (hospital groups / hospitals) work exclusively in the `/admin` area.

Consequences for the design:

- Optimise for **operator efficiency** (one expert user), not onboarding polish: dense lists, shortcuts, direct actions.
- Quick actions and menus target **platform operations** (tenants, plans & billing, users, roles, later: audit, security, platform settings).
- The permission model stays simple (`SUPER_ADMIN` only); hardening matters more than role granularity: mandatory 2FA, optional IP allow-list, every write audited (`Sys_AuditLog`).
- `/admin` and `/superadmin` stay separate products on one codebase. Note: `authGuardFn` deliberately rejects an account whose only role is `SUPER_ADMIN`, so the header "Back to Admin" link returns 403 for a pure owner account (see §16).

---

## 1. UX Audit — Current State

| Area | Finding |
|---|---|
| Shell | Hand-built 240px sidebar with its own colours (`border-gray-200`, `text-brandDark` for every text level). Looks different from the admin panel; no collapse, no tablet/mobile behaviour. Nav items were `<div [routerLink]>` (not keyboard reachable) — fixed by the DB-driven menu. |
| Navigation | Sidebar was hard-coded; Billing was unreachable; Tenants was commented out while the dashboard linked to it. Now DB-driven (`MenuService.superadminMenus`). |
| Page chrome | Every page re-implements its own title block and stat cards with inline markup (`bg-surface rounded-xl border border-gray-200 …`), mixing `text-brandDark`, `text-primary`, `text-secondary` for the same role. |
| Stats | Users "Active / Verified / Inactive" were computed from the **current page only** → wrong with pagination. Dashboard counts used four paged searches with `pageSize: 1`. |
| States | Users table has no error state; dashboard has no error state (a failed `forkJoin` leaves skeletons forever); Roles shows blank on error. |
| Duplication | `getPages`, `min`, paging and filter state copied between Users and Roles; Billing has its own prev/next pager. |
| Accessibility | Icon-only logout without visible label; no skip link; stat tiles clickable `div`s. |

## 2. Current Problems (to fix)

1. Visual inconsistency with the admin panel (colour tokens, radius, shadows).
2. Wrong or misleading statistics.
3. Missing loading / empty / error states.
4. No reusable page scaffold → copy-paste per page.
5. Several platform capabilities have a backend but no UI (audit log, login history, IP blocking, tenant invites, platform settings).

## 3. Information Architecture

Sidebar sections come from the `AdminMenu` table (rows whose root route starts with `/superadmin`).

```
Overview            Dashboard
Tenants             Hospital Groups (= tenants) · Tenant Detail · Invitations · Onboarding
Billing             Plans · Subscriptions · Invoices
Access Control      Users · Roles & Permissions · Menu Management
Master Data         Lab Tests · Lab Test Categories · Imaging Modalities · Medical Specialties
                    · Insurance Companies · Manufacturers · Suppliers · Appointment Types
Content             Articles
Platform            Settings · Sequence Rules · Print Templates · Localization · App Releases · Media Library
Security            Audit Logs · Login History · Blocked IPs
System              Health (later)
```

### 3.1 Ownership rule — what belongs in Super Admin

Decided from the domain model (`PhysioBoo.Domain/Entities`):

> **Platform-wide data (not a `TenantEntity`) is owned by the Super Admin. Per-tenant data (`TenantEntity`) stays in `/admin`.**
>
> Corollary (owner decision, 2026-10-11): the Super Admin manages **tenants** (Hospital Groups), not their **hospitals**. Hospitals are created and run by each tenant in `/admin`; Super Admin only reads them on the tenant detail page.

| Module | Backed by (platform-wide) | Lives today | Priority |
|---|---|---|---|
| Tenants | `HospitalGroup`, `Hospital` (tenant unit), `TenantInvite` | partly `admin/system/common-category` | High |
| Billing | `SubscriptionPlan`, `TenantSubscription`, `SubscriptionInvoice` | `superadmin/billing` | High |
| Access Control | `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `AdminMenu` | `superadmin/users`, `superadmin/roles`; menu in `admin/system/setting/admin-menu` | High |
| **Master Data** | `LabTest`, `LabTestCategory`, `ImagingModality`, `MedicalSpecialty`, `InsuranceCompany`, `Manufacturer`, `Supplier`, `AppointmentType` | `admin/system/common-category` | **High** |
| **Platform Settings** | `SystemSetting`, `Sys_Setting`, `Sys_SequenceTracker`, `AppConfig.features` | `admin/system/setting` | **High** |
| Print Templates | `PrintTemplate`, `PrintTemplateVersion`, `PrintLog` | `admin/system/print-template` | Medium |
| Content | `Article` | admin CMS | Medium |
| App Releases & Devices | `Sys_AppVersion`, `Sys_Device` | — (see `mobile-app-redesign.md`) | Medium |
| Localization | `Sys_Language`, `Sys_Resource` | — | Medium |
| Media Library | `Sys_MediaFile` | admin file manager | Low |
| Security | `Sys_AuditLog`, `UserLogin`, blocked IPs (`SystemEndpoints`) | — | Medium |
| System Health | outbox / RabbitMQ / Redis status (proposed, no entity) | — | Low |
| Announcements | none (proposed, needs new backend) | — | Low |

**Key finding — Master Data has the wrong owner.** The eight catalogs above are shared by every tenant but are edited from `/admin`. A hospital administrator changing a lab test changes it for all hospitals. They move to Super Admin; tenants consume them read-only (or pick from them).

**Stays in `/admin` (tenant-scoped):** Home banners / features / settings / testimonials, Leads, Campaigns, Complaints, Reviews, Rewards, Academy courses, `MedicineCategory`, and all clinical / operational entities.

**Build order:** (1) Tenants + Billing → (2) Master Data + Platform Settings → (3) Access Control (move Menu Management) + Security → (4) Print Templates, Content, Releases, Localization → (5) Dashboard "Attention" panel.

## 4. User Journey

Platform owner signs in → lands on Overview (health at a glance: tenants, subscriptions, past-due, recent activity) → drills into a tenant (subscription, usage vs plan limits, staff) → adjusts access (users / roles) → reviews security events → changes platform settings. Every list page follows the same flow: scan stats → search / filter / sort → open row drawer → act → toast → list refreshes.

## 5. Layout

```
┌───────────────┬───────────────────────────────────────────────┐
│ Logo          │ Sticky header: page title · back to Admin      │
│ DB-driven nav ├───────────────────────────────────────────────┤
│ (sections +   │ Page header (title, description, actions)      │
│  items)       │ Stat strip (boo-stat-card × n)                 │
│               │ Content card (table / grid / form)             │
│ User + Logout │                                                │
└───────────────┴───────────────────────────────────────────────┘
```

Desktop-first. ≥1024px persistent sidebar; <1024px the sidebar becomes an off-canvas drawer toggled from the header (hamburger, 44×44px).

## 6. Wireframes

**Dashboard**
```
[Platform Overview]                                   [Refresh]
┌ Welcome back, <first name> ──────────────────────────────────────────┐
│ ( ◯ )   ( ◯ )   ( ◯ )   ( ◯ )   ( ◯ )     ← quick actions (2 rows of 5):     │
│ Tenants Plans & Users   Roles & Menu        round icon + label, each         │
│         billing         access  management  deep-links to a Super Admin page │
│ ( ◯ )   ( ◯ )   ( ◯ )   ( ◯ )   ( ◯ )                                        │
│ Master  Audit   IP      Sequence Localization                                │
│ data    logs    access  rules                                                │
└────────────────────────────────────────────────────────────────────────────┘
┌ Newest tenants ──────────┐ ┌ Newest users ──────────────┐
│ name · hospitals · date  │ │ email · joined · status    │
│ status badge             │ │                            │
└──────────────────────────┘ └────────────────────────────┘
```
Each panel has its own loading / empty / error state with Retry (never an endless skeleton). An "Attention" panel (past-due subscriptions, expiring invites) is added once `GET /api/platform/attention` exists.

**List page (Users / Roles / Tenants …)**
```
[Title + description]                        [Primary action]
[stat][stat][stat][stat]
[search]                      [reload][filter][sort]
┌ table / card grid ────────────────────────────────────────┐
└───────────────────────────────────────────────────────────┘
pagination
```

## 7. Component Hierarchy

```
SuperadminLayoutComponent (shell)
├── SidebarItemComponent        (reused, DB-driven)
├── <router-outlet>
└── pages
    ├── SuperadminPageHeaderComponent   (NEW — title, description, actions slot)
    ├── StatCardComponent               (reused boo-stat-card)
    ├── StatusBadgeComponent            (reused boo-status-badge)
    ├── EmptyStateComponent / ErrorStateComponent (reused)
    └── BooTableAdminComponent / drawers (reused)
```

Only **one** new shared component is introduced (`superadmin-page-header`), because every page repeats that block. Everything else is reused.

## 8. UI Specification

Tokens only — no raw hex, no `gray-*` for borders/text:

| Role | Token |
|---|---|
| Surface | `bg-surface` |
| Page background | `bg-body` |
| Border | `border-borderGray/60` |
| Primary text | `text-regular` |
| Secondary text | `text-secondary` |
| Brand / links / active | `text-primary`, `bg-primary/10` |
| Danger | `text-danger` |
| Radius | cards `rounded-2` (8px); controls `rounded-1.5` |
| Elevation | `shadow-card` on hover only |
| Spacing | 4/8 rhythm: `gap-3`, `space-y-5`, page padding `p-5` |

Type scale: page title `text-xl font-bold`, section title `text-sm font-semibold`, body `text-[13px]`, meta `text-[12px] text-secondary`. Numbers in tables/stats use `tabular-nums`.

## 9. Interaction Design

- Hover/active transitions 150–200ms, `transform`/`opacity` only; respect `prefers-reduced-motion`.
- Drawer for create/edit (reuse existing drawers); confirm destructive actions through `DialogService.confirmDelete`.
- Destructive actions are separated and styled `danger`.
- Toasts for success/error; they never steal focus.

## 10. Responsive Behaviour

- ≥1024px: fixed sidebar (240px), content max-width fluid.
- 768–1023px: off-canvas sidebar, 2-column stat grid.
- <768px: single column, tables scroll inside their card (never the page), actions collapse into the row menu.

## 11. Accessibility

- Landmarks: `<aside>` + `<nav aria-label>` + `<main id="main">`; skip link to `#main`.
- Nav items are real `<a routerLink>` (via `sidebar-item`), visible focus ring, active state not colour-only (left indicator + weight).
- Icon-only buttons carry `aria-label`; touch targets ≥ 44px on touch breakpoints.
- Contrast AA with theme tokens; status never conveyed by colour alone (dot + text).
- Empty/error states use `role="status"` / `role="alert"`.

## 12. Page States

| State | Treatment |
|---|---|
| Loading | Skeleton rows/cards (no blocking spinner >300ms) |
| Empty | `boo-empty-state` with the next action |
| Error | `boo-error-state` + Retry |
| Success | Toast + list refresh |
| Disabled | Reduced opacity + `cursor-not-allowed` + `disabled` attribute |
| No menu rows | Layout shows "No pages available" (menu loaded but empty) |

## 13. Edge Cases

- Menu not yet configured / not yet loaded (skeleton vs empty message — `MenuService.loaded`).
- Super Admin holds all permissions, so `Mine` also returns admin rows → filtered by route prefix.
- Tenant with no subscription → badge "No plan", billing page offers "Assign plan".
- Stats unavailable → card shows "—" and the page still works.
- Large lists → server-side paging only; never client-side filtering of a page.

## 14. Performance Considerations

- Lazy-loaded routes (already) plus `PreloadAllModules`.
- Debounced search (existing `boo-input`).
- Stat counts must come from a stats endpoint, not from paging a list (see §17).
- Virtual scrolling for audit logs (50k+ rows) — cursor/keyset paging server-side.

## 15. Scalability

- One list pattern for all modules; adding a module = menu row + route + page using the shared header/stat/table pieces.
- Menu is data, so new modules need no sidebar code change.
- Per-module permission codes gate both the menu row and the route guard.

## 16. Enterprise Recommendations

- Verify how SUPER_ADMIN bypasses the EF tenant filter before building cross-tenant pages (users, audit, tenants).
- Audit every Super Admin write (existing `Sys_AuditLog`).
- Decide what "Back to Admin" means for an owner account: `authGuardFn` rejects accounts whose only role is `SUPER_ADMIN`, so the header link currently ends in 403. Either remove it (owner never enters tenant workspaces) or give the owner an additional staff role / a dedicated "preview admin" path.
- Harden the owner account: mandatory 2FA, optional IP allow-list, short session lifetime for `/superadmin`.
- Optional later: "view as tenant" impersonation with mandatory reason + audit entry.
- Export (CSV) for audit logs and invoices.

---

Quick actions: ten icon tiles (`landmark`, `credit-card`, `users`, `key`, `list`, `database`, `history`, `lock`, `hash`, `globe`) as real `<a routerLink>` inside a labelled `<nav>`; ≥56px circles, visible focus ring, hover lift disabled under `prefers-reduced-motion`. Tiles are added only when their page exists (one tile per Super Admin page; the stat-card row was removed because the counts duplicated the lists).

## 17. Proposed API Contract (propose only — not implemented)

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Platform overview stats | GET | `/api/platform/overview` | — | `{ tenants, hospitals, users, roles, activeSubscriptions, pastDueSubscriptions, mrr, currency }` | Dashboard stat cards |
| Platform attention items | GET | `/api/platform/attention` | `?limit=10` | `[{ type, severity, title, tenantId, createdAt }]` | Dashboard "Attention" |
| User stats | GET | `/api/users/stats` | — | `{ total, active, inactive, verified }` | Users stat strip |
| Role stats | GET | `/api/roles/stats` | — | `{ total, active, system }` | Roles stat strip |
| Tenant detail | GET | `/api/hospital-groups/{id}/detail` | — | group + hospitals + subscription + usage vs limits | Tenant detail |
| Suspend / reactivate tenant | POST | `/api/hospital-groups/{id}/suspend` / `/reactivate` | `{ reason }` | `{ success }` | Tenant actions |
| Audit log search | POST | `/api/audit-logs/search` | paged + `{ userId, tableName, action, from, to }` | paged `AuditLog` | Security → Audit Logs |
| Login history | POST | `/api/users/login-history/search` | paged + `{ userId, from, to, success }` | paged `{ userId, ip, userAgent, at, success }` | Security → Login History |
| Blocked IPs | GET | `/api/systems/blocked-ips` | — | `[{ ip, reason, blockedAt }]` | Security → Blocked IPs |
| Platform settings | GET / PUT | `/api/platform/settings` | grouped key/values | grouped key/values | Platform Settings |

Master Data move (§3.1) — contract proposals, no new tables:

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Tenant read access to shared catalogs | GET / POST search | existing catalog endpoints (`/api/lab-tests`, `/api/manufacturers`, …) | unchanged | unchanged | `/admin` keeps read/select only |
| Restrict catalog writes to platform owner | — | same endpoints | — | `403` for non-`SUPER_ADMIN` on create/update/delete | Super Admin Master Data pages |
| App versions | POST search / POST / PATCH | `/api/app-versions` | `{ platform, version, minSupported, notes, releasedAt }` | paged / id | Platform → App Releases |
| Devices | POST search | `/api/devices/search` | paged + `{ userId, platform }` | paged `Sys_Device` | Platform → App Releases |

Existing endpoints reused unchanged: users / roles / permissions search, `AdminMenus`, `Subscriptions`, `Tenants/register`, `Invites`, `Systems/block-ip`, `Systems/unblock-ip`.

**Interim (placeholder) behaviour:** until `/stats` endpoints exist, stat counts are derived from existing search endpoints with `pageSize: 1` and `filter` values, reading `totalCount` — implemented once in the service layer (`UserService.getStats`, `RoleService.getStats`) so the swap is a one-line change.

---

## 18. Implementation Status

| Item | Status |
|---|---|
| DB-driven sidebar, empty/loading menu state | Done |
| Shared `SuperadminPageHeaderComponent` | Done |
| Shell restyle (tokens, landmarks, skip link, mobile drawer) | Done |
| Dashboard rebuild (stat cards, newest tenants / users panels, per-panel states) | Done |
| `PlatformService`, `UserService.getStats`, `RoleService.getStats` (placeholders until §17 endpoints exist) | Done |
| Users page (header, real stats, states) | Done |
| Roles page (header, real stats, shared empty state) | Done |
| Quick-actions panel on the dashboard (5 tiles to existing pages) | Done |
| Module map and ownership rule (§3, §3.1) | Done (documented) |
| 1a. Tenants: list + detail (hospital management removed — tenant-controlled) | Done — see `superadmin-tenants-redesign.md` |
| 1b. Billing: stats, Subscriptions / Plans tabs, subscription + plan drawers | Done — see `superadmin-billing-redesign.md` |
| 1c. Tenant invitations & onboarding queue | **Dropped** — invites are tenant-scoped (tenants invite their own staff in `/admin`); self-service sign-up needs no approval, new tenants already show under "Newest tenants" and Billing → Trial |
| 2. Master Data (8 shared catalogs, generic list) | Done — see `superadmin-platform-redesign.md` |
| 2b. Platform: sequence rules, localization | Done — see `superadmin-platform-redesign.md` |
| 3. Access Control: Menu management; Security: audit logs, IP access | Done — see `superadmin-platform-redesign.md` |
| 4. Print templates, Articles | Planned — existing admin pages hard-link to `/admin/...`, need a rebuild |
| 4b. Login history, blocked-IP list, platform settings, app releases | Blocked on API — contracts in `superadmin-platform-redesign.md` §12 |
| 5. System Health, Announcements, dashboard "Attention" panel | Backlog |
