# Super Admin — Master Data, Menus, Security & Platform

**Paths:** `/superadmin/master-data[/:catalog]`, `/superadmin/menus`, `/superadmin/security/audit-logs`, `/superadmin/security/ip-access`, `/superadmin/platform/sequence-rules`, `/superadmin/platform/localization`
**Parent doc:** `superadmin-redesign.md` (§3.1 ownership rule: platform-wide data belongs to the platform owner). **Siblings:** `superadmin-tenants-redesign.md`, `superadmin-billing-redesign.md`.
**Audience:** the platform owner only.

---

## 1. UX Audit — Current State

| Area | Finding |
|---|---|
| Master data | Eight shared catalogs (lab tests, categories, imaging modalities, specialties, appointment types, insurers, manufacturers, suppliers) are edited from `/admin/system/common-category`, so a **tenant admin can change data every tenant shares**. Each catalog is ~370 lines of copy-pasted list code + a table card + a drawer. Names render red (`text-danger`); `item.IsEmergency` (capital I) never matched, so the Emergency column was always empty; the table never shows a loading state (`'search'` key is never set). |
| Menu management | Lives under `/admin/system/setting`. **Bug:** editing an item never loads its `parentId` (the API view model has none), so saving an edit silently moves the item to the top level. Icon is free text (a typo breaks the sidebar), permission code is free text and the API rejects an empty one, no distinction between the Super Admin and Admin menus, no way to see the whole tree at a glance. |
| Audit logs | Backend exists (`api/audit-logs`, comment in code: "no frontend page consumes this yet"). Nothing in the UI. |
| IP blocking | Backend exists (`api/systems/block-ip`, `unblock-ip`). Nothing in the UI. |
| Sequence rules | Admin-only page; "Next code" is invisible, so the effect of a prefix / date format / length is guesswork. |
| Localization | `api/resources` (search, import) has no UI. |

## 2. Current Problems (to fix)

1. Platform-wide data editable by tenants (ownership).
2. Duplicated list code per catalog; inconsistent look; broken columns.
3. Menu editor loses hierarchy on edit, accepts invalid icons/permissions.
4. Security capabilities with no UI.
5. No loading / empty / error states.

## 3. Information Architecture

```
Master data (hub)        card per catalog with record count + "platform-wide" notice
└── /master-data/:catalog   Lab tests · Lab test categories · Imaging modalities · Medical specialties
                            Appointment types · Insurance companies · Manufacturers · Suppliers
Access control
└── /menus                  Menu management: tabs [Super Admin menu | Admin menu] → sections → pages
Security
├── /security/audit-logs    filters + table + entry drawer (column-by-column before/after)
└── /security/ip-access     block / unblock an address
Platform
├── /platform/sequence-rules   how generated codes are numbered (+ "Next code" preview)
└── /platform/localization     language resources: read + import (file / URL)
```

## 4. User Journey

- **Master data:** hub → pick a catalog → search / filter / sort → open row → drawer → save → list refreshes. A banner reminds that changes apply to **all tenants**.
- **Menus:** choose area → see sections with their pages → "Add page" under a section / "New section" → drawer (icon and permission are validated pickers) → saved → the owner's own sidebar refreshes without re-login.
- **Audit:** set filters (table, action, dates) → open an entry → read who/when/IP and the exact column changes.
- **IP access:** enter address, duration, reason → confirmation → blocked; to undo, enter the address under "Unblock".

## 5. Layout

All pages use the shared pattern: `superadmin-page-header` → content cards. List pages use `boo-table-admin` (search, sort, filter, paging in its toolbar/footer) inside a bordered card; detail/edit happens in a right-hand `drawer` (≤ 640px, full width on mobile). Menus use a two-level card list; Audit adds a filter bar above the table.

## 6. Component Hierarchy

```
Master data
├── SuperadminMasterDataHubComponent            (hub)
├── SuperadminMasterDataListComponent           (generic list, route :catalog or route data)
│   ├── SuperadminMasterDataTableCardComponent  (columns from config)
│   └── <catalog drawer>                         (existing drawer, created dynamically)
└── MasterDataRegistry                           (service: one config per catalog / collection)

Menus: SuperadminMenuManagementComponent → SuperadminTabsComponent · SuperadminMenuTreeComponent · SuperadminMenuDrawerComponent
Security: SuperadminAuditLogsComponent → SuperadminAuditLogDrawerComponent · SuperadminIpAccessComponent
Platform: SuperadminLocalizationComponent  (+ generic list for sequence rules)
```

**One generic list instead of eight.** Every catalog drawer and service already shared the same shape (`isOpen`, `currentId`, `close`, `saveSuccess`, `delete`; `search(request)`, `delete(id)`), so a catalog is now ~25 lines of config in `MasterDataRegistry` (columns, filters, permission, service, drawer). Adding a catalog or platform collection = one config entry + one menu row.

Reused: `boo-table-admin`, `drawer`, `boo-status-badge`, `boo-empty-state`, `boo-error-state`, `DialogService`, `ToastService`, `PermissionService`, `MenuService`. New shared bits: `shared/utils/menu.utils.ts` (icon registry, area, permission), `shared/utils/audit-log.utils.ts` (diff).

## 7. UI Specification

Tokens only (parent §8). Names are `text-primary font-medium` buttons (real `<button>`s), meta text `text-secondary`, statuses via `boo-status-badge` (Create = success, Update = primary, Delete = danger). Code, IPs, ids and keys use `font-mono`; numbers/dates `tabular-nums`. Destructive actions use the danger tone and always confirm. One filled primary button per page.

## 8. Interaction Design

- Generic list: debounced search, sort (Recent / Oldest / Name / Code, or Recent / Oldest for sequence rules), per-catalog boolean filters; delete confirms and steps back a page when the last row of a page is removed.
- Menu drawer: placement select (top-level / inside a section), icon picker with datalist of registered icons only, permission `<select>` grouped by category (falls back to a text field if the list can't load), route must start with `/superadmin` in the Super Admin area, a section that still has pages stays top-level (sidebar is two levels deep), deleting a section warns it also deletes its pages.
- Audit: filters apply on Enter / change; dates cover whole local days; entry drawer loads the full row on open.
- IP access: validates IPv4/IPv6, requires a reason, confirms before blocking, warns about blocking one's own address.
- Localization: client-side search over the language's resources (first 200 shown), import from a `.json` file or a URL, result shows inserted / updated counts.

## 9. Responsive Behaviour

Cards grids 1 → 2 → 3 columns; tables scroll inside their card; filter bars wrap; drawers are `min(520–640px, viewport)`.

## 10. Accessibility

Landmarks and headings per section; every form control has a visible `<label for>`; errors sit under the field; icon-only buttons carry `aria-label` + `title`; tabs follow the ARIA tabs pattern; drawers are `role="dialog" aria-modal` with a labelled title; status is never colour-only; `prefers-reduced-motion` disables skeleton pulses.

## 11. Page States

Every page implements loading (skeleton), empty (`boo-empty-state` with the next action), error (`boo-error-state` + Retry) and busy (buttons disabled while a request runs). Partial failures degrade locally (e.g. a catalog count shows "—", the permission picker becomes a text field).

## 12. Proposed API Contract (propose only — not implemented)

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Restrict catalog writes to the platform owner | — | existing catalog endpoints | — | `403` on create/update/delete for non-`SUPER_ADMIN` | makes the Master Data pages the only editor |
| Menu row parent | GET | `/api/admin-menus/{id}` | — | add `parentId` to `AdminMenuViewModel` | removes the need to infer the parent from the tree |
| Menu reorder | PATCH | `/api/admin-menus/reorder` | `[{ id, order, parentId }]` | `204` | drag-and-drop ordering (future) |
| Blocked IP list | GET | `/api/systems/blocked-ips` | — | `[{ ipAddress, reason, blockedAt, expiresAt, blockedBy }]` | IP access → list with per-row "Unblock" |
| Login history | POST | `/api/users/login-history/search` | paged + `{ userId, from, to, success }` | paged `{ userId, email, ip, userAgent, at, success }` | Security → Login history |
| Platform settings | GET / PUT | `/api/platform/settings` | grouped key/values (typed) | grouped key/values | Platform → Settings |
| App versions | POST search / POST / PATCH | `/api/app-versions` | `{ platform, version, minSupported, notes, releasedAt }` | paged / id | Platform → App releases |
| Devices | POST | `/api/devices/search` | paged + `{ userId, platform }` | paged `Sys_Device` | Platform → App releases |
| Audit export | GET | `/api/audit-logs/export` | same filters | CSV | Audit logs → Export |

Existing endpoints used unchanged: catalog `search`/`delete` + drawers' create/update, `admin-menus` (search, create, update, delete, mine), `permissions/search`, `audit-logs/search` + `/{id}`, `systems/block-ip` + `unblock-ip`, `sequence-trackers`, `resources/search`, `import-local`, `import-remote`, `config`.

## 13. Edge Cases

- A saved menu permission that no longer exists stays selectable ("(current)") instead of resetting.
- A menu row whose icon isn't registered is flagged "Unknown icon" in the tree (the sidebar cannot draw it).
- Audit entry without old/new JSON → "No column values were recorded"; non-JSON `affectedColumns` falls back to the union of old/new keys; `Update` entries hide unchanged columns.
- Resource text that isn't JSON is shown raw instead of failing.
- Sequence "Next code" mirrors the server (`{prefix}{date}-{padded number}{suffix}`); with a date format the counter resets daily.
- Opening an unknown catalog slug redirects to Super Admin home; missing permission redirects to 403.

## 14. Performance

Hub counts load in parallel, each failing independently. Catalog lists are server-paged (20). Audit list is server-paged (25) and filtered server-side. Localization renders at most 200 rows. Icon list (~330 names) is a single `<datalist>`.

## 15. Scalability

New catalog / platform collection = one `MasterDataRegistry` entry + one menu row. New audit filters = fields on `AuditLogQuery`. The menu drawer already takes `area`, so a third area (e.g. partner portal) is a prefix constant away.

## 16. Enterprise Recommendations

- Enforce catalog write restriction on the server (§12) — until then tenants can still reach the old admin catalog pages.
- Audit every Super Admin write; add CSV export and retention rules.
- Surface blocked IPs with expiry (needs the list endpoint) and login history for investigations.
- Add drag-and-drop ordering once the reorder endpoint exists.

## 17. Implementation Status

| Item | Status |
|---|---|
| Master Data hub + generic catalog list (8 catalogs) | Done |
| Menu management (area tabs, tree, validated drawer, live sidebar refresh) | Done |
| Audit logs (filters, table, entry drawer with diff) | Done |
| IP access (block / unblock) | Done |
| Sequence rules (generic list + "Next code") | Done |
| Localization (read + import) | Done |
| Tenant invitations / onboarding queue | **Dropped** — invites are tenant-scoped (`/admin` team page); self-service sign-up needs no approval |
| Print templates, Articles | Planned — existing admin pages hard-link to `/admin/...`, need a rebuild |
| Login history, blocked-IP list, Platform settings, App releases | Blocked on API (§12) |
| Remove / read-only the old admin catalog pages | Waiting for the server-side write restriction |
| Locations (country / city / district / ward) | Read API built + frontend switched (`location-api-contract.md` §10: needs migration + `seed-geography.sql`); management endpoints and Master Data pages still open |
