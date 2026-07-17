# Superadmin Role List Redesign

**Path:** `superadmin/roles` (`src/app/pages/superadmin/roles`)
**Scope:** Wire the existing card-grid role list up to real CRUD + permission assignment, reusing the drawer/service already built for `admin/system/user-permission` — no new API surface, no new visual system.

---

## 1. UX Audit — Previous State

`SuperadminRoleListComponent` rendered a polished card grid (stats, search, filter, sort, pagination, loading/empty states) but was functionally a dead end:

- The only row action was **View**, which just fired a toast (`Role: {name} ({code})`) — no drawer, no detail.
- No **Create Role** entry point anywhere on the page.
- No **Edit** or **Delete**.
- No way to see or change which permissions a role grants — the single most important fact about a role in an access-control screen.

Meanwhile `admin/system/user-permission` (roles tab) already solved all of this: `UserPermissionRoleDrawerComponent` provides identity fields (name/code/description), color/icon pickers, and a categorized permission checklist, backed by `RoleService.create/update/delete/getPermissions/assignPermission/removePermission` and `PermissionService.search`. The superadmin **users** list already reuses `UserPermissionUserDrawerComponent` the same way — this redesign applies the identical pattern to roles, so the two superadmin list pages stay consistent with each other and with the admin panel.

## 2. Problems Being Fixed

1. No create/edit/delete for roles at the superadmin level (had to go to admin panel's Users & Permissions screen instead — inconsistent surface for a superadmin tool).
2. "View" action was a no-op toast, not a real detail view.
3. Role cards showed no permission count, so admins couldn't gauge a role's scope at a glance.
4. System roles had no protection against accidental deletion in this view (the admin screen already guards this; the superadmin view had no delete at all, so no guard existed).

## 3. Information Architecture

```
Superadmin Roles Page (/superadmin/roles)
├── Header — title/subtitle + "Create Role" primary action (new)
├── Stats strip — Total / Active / System (unchanged)
├── Toolbar — search, reload, filter (status/type), sort (unchanged)
├── Card grid — one card per role (unchanged visual language)
│   └── Row actions — Edit, Delete (System roles: Delete disabled) (was: View only)
├── Empty / loading states (unchanged)
├── Pagination (unchanged)
└── Role Drawer (reused: UserPermissionRoleDrawerComponent)
    ├── Identity (name, code, description)
    ├── Appearance (color, icon)
    └── Permissions matrix (grouped by category, select-all per group)
```

## 4. User Journey

Superadmin opens Roles → scans stats + card grid → clicks **Create Role** or a card's **Edit** action → drawer opens with identity/appearance/permission-matrix → toggles permissions by category → **Save** persists role + diffs permission assignments → toast confirms → grid reloads. For an unwanted custom role, **Delete** on the card (or inside the drawer) asks for confirmation via `DialogService.confirmDelete`; system roles are blocked with a toast instead of a native `confirm()`.

## 5. Component Hierarchy

```
SuperadminRoleListComponent (page)
├── existing toolbar/stat/card-grid template (kept as-is)
├── boo-action-admin actions: Edit, Delete (per card, replaces View)
└── UserPermissionRoleDrawerComponent (reused, unmodified)
```

No new shared component is introduced — the drawer, its inputs/outputs, `ColorUtils`, and `IconUtils` are reused verbatim from `components/layout/admin/system/user-permission/role-drawer.component.ts`.

## 6. Interaction & State

- **Create:** reset form to defaults (`ColorUtils.roleColors[1]`, `IconUtils.roleIcons[0]`, `isSystemRole: false`), empty permission draft, open drawer.
- **Edit:** patch form from the selected role, fetch `RoleService.getPermissions(id)` to seed the permission draft, open drawer.
- **Save:** validate form → create or update role → diff permission draft against the role's current permissions → `assignPermission`/`removePermission` calls in parallel → toast → close drawer → reload list.
- **Delete:** system roles are rejected with an error toast (`System roles cannot be deleted`), same rule the admin panel enforces; custom roles go through `DialogService.confirmDelete`.
- Loading/empty/error states are unchanged (already implemented via `LocalLoadingService` + skeleton grid + empty panel).

## 7. API Contract

No new endpoints. Reuses the contract already implemented and consumed elsewhere in the app via `RoleService` and `PermissionService`:

| Purpose | Method | URL | Frontend Usage |
|---|---|---|---|
| List roles | POST | `BASE_API.ROLE.SEARCH` | grid data |
| Get role permissions | GET | `BASE_API.ROLE.BASE/{id}/permissions` | seed drawer draft on edit |
| Create role | POST | `BASE_API.ROLE.CREATE` | drawer save (new) |
| Update role | PATCH | `BASE_API.ROLE.BASE/{id}` | drawer save (existing) |
| Delete role | DELETE | `BASE_API.ROLE.BASE/{id}` | card delete action |
| Assign permission | POST | `BASE_API.ROLE.ASSIGN_PERMISSION` | drawer save diff |
| Remove permission | DELETE | `BASE_API.ROLE.BASE/{roleId}/permissions/{permissionId}` | drawer save diff |
| List permissions | POST | `BASE_API.PERMISSION.SEARCH` | permission matrix source |

## 8. Accessibility & Responsive

Unchanged from the existing card grid (already responsive `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`, keyboard-operable buttons, adequate touch targets). The drawer is an existing, already-audited component reused without modification.

## 9. Edge Cases

- Deleting a system role → blocked client-side with a toast (defense in depth; server should also reject).
- Creating a role with a duplicate `code` → surfaces as `CATCH_ERROR_AFTER_CREATING_OR_UPDATING` toast (same pattern as Users/Permissions tabs; no bespoke validation added since the backend is the source of truth for uniqueness).
- Editing a role whose permissions fail to load → draft falls back to an empty set rather than blocking the drawer from opening (matches existing `openEditRole` behavior in the admin panel).
