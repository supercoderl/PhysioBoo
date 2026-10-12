# Admin — Hospital (Branch) Management

**Path:** `/admin/system/hospital` (new). **Menu:** one `AdminMenus` row under the System section (JSON in §14).
**Audience:** a tenant administrator managing the branches of their own hospital group.
**Related:** `superadmin-tenants-redesign.md` (read-only Hospitals tab), `dev-data-generator-redesign.md` (generates branches for a tenant).

---

## 1. UX Audit — Current State

| Area | Finding |
|---|---|
| Reachability | A hospital list page existed in `pages/admin/system/common-category/hospital/`, but **no route pointed to it**, so it could not be opened, and it had no menu entry. |
| Data model | The frontend `Hospital` type (`code`, `type`, `totalBeds`, `hasIcu`, `hasEmergencyServices`, `hospitalGroupName`) did not match the API (`hospitalCode`, `hospitalType`, `bedCapacity`, `icuCapacity`, `emergencyCapacity`, …). Every column and every drawer field would be blank or wrong. The same mismatch blanked code, type and beds on the Super Admin tenant detail "Hospitals" tab. |
| Drawer | "Hospital Group" was a select with an empty option list; required API fields (state/province, accreditation body, insurance accepted, languages) were missing, so Create could never succeed; Save posted the form as-is, which the API cannot bind. |
| Filters | Status / Emergency filters were sent, but the API search only honours text search, date range and sorting, so the filters did nothing. |
| Sorting | The initial sort `createdAt:desc` and the option values `-createdAt` / `+name` disagreed. |
| Delete | No check that the branch has departments, rooms or beds attached. |

## 2. Current Problems (fixed by this redesign)

1. Page unreachable and without a menu entry.
2. Types, table and drawer did not match the API.
3. Create impossible (missing required fields, no hospital group).
4. Filters that did nothing.
5. No loading / empty / error states in the page body.

## 3. Information Architecture

```
System
└── Hospital (branches)        /admin/system/hospital
    ├── Table: search · sort · paging · reload
    └── Drawer: Identity · Location · Contact · Capacity · Compliance · Services
```

## 4. User Journey

1. Open **System → Hospital**. The table lists the tenant's branches (newest first).
2. Search by name / code / city, sort, page.
3. **New branch** → drawer → fill required fields → Save → the list reloads and a toast confirms.
4. Click a row's name → drawer with the saved values → change → Save → the list reloads.
5. **Delete** from the row menu or the drawer → confirmation → the list reloads (an error toast if the server refuses).

## 5. Layout

Standard admin list: `admin-content-header` with the title and a primary **New branch** button, then a full-height `boo-table-admin` card (search, sort and reload live in its toolbar, paging in its footer). Edit/create happens in a 720px right drawer with a sticky header (title, close) and sticky footer (Delete · Cancel · Save).

## 6. Wireframe

```
┌ Hospital (branches) ─────────────────────────── [ + New branch ] ┐
│ [search…]  [sort ▾]  [reload]                                    │
│ ┌──────────────┬────────────┬─────────────┬─────────┬────┬────┐ │
│ │ Branch       │ Type       │ Location    │ Beds/ICU│ Svc│ ⋮  │ │
│ │ Riverside…   │ Clinic     │ Oakridge, US│ 40 / 6  │ ER │ ⋮  │ │
│ └──────────────┴────────────┴─────────────┴─────────┴────┴────┘ │
│ ‹ 1 2 3 ›                                                        │
└──────────────────────────────────────────────────────────────────┘
```

## 7. Component Hierarchy

```
AdminHospitalListComponent                  pages/admin/system/hospital/list.component.ts
├── AdminContentHeaderComponent             (existing)
├── AdminHospitalTableCardComponent         components/layout/admin/system/hospital/  (wraps boo-table-admin)
└── AdminHospitalDrawerComponent            components/layout/admin/system/hospital/
HospitalService                             (existing; typed against the real API now)
```

The old `CommonCategoryHospital*` files were deleted. Nothing else imported them.

## 8. UI Specification

- **Columns:** Branch (name + code), Type (`hospitalTypeLabel`), Location (city, country), Beds / ICU, Services (ER badge when `emergencyCapacity > 0`, ICU badge when `icuCapacity > 0`, 24h badge), Status badge, Actions (Edit, Delete).
- **Drawer sections and fields** (required marked *):
  - Identity: Name*, Type*, Description.
  - Location: Address*, City*, State / Province*, Postal code, Country*.
  - Contact: Phone, Emergency phone, Ambulance phone, Fax, Email, Website.
  - Capacity: Emergency capacity, Operation theaters, and (edit only) Bed capacity, ICU capacity.
  - Compliance: License number, License expiry, Accreditation body*, Accreditation expiry.
  - Services: Insurance accepted* (comma separated), Languages supported* (comma separated), and (edit only) Open 24 hours, Active.
- Fields the form does not show (coordinates, established date, facilities, operating hours, logo, images, mission, vision) are kept from the loaded record on update, so editing never wipes them.

## 9. Interaction Design

- Save is blocked while saving; an invalid submit marks fields touched and shows a toast.
- Insurance and languages are entered as comma-separated text and sent as trimmed, non-empty arrays.
- Delete asks for confirmation (`DialogService.confirmDelete`), then reloads the list; deleting the last row of a page steps back one page.
- Escape / the close button closes the drawer; unsaved changes are not guarded (same as the other admin drawers).

## 10. Responsive Behaviour

Desktop first. The table scrolls inside its card on narrow screens; the drawer is full width on small screens (existing `drawer` behaviour); form grids collapse from two columns to one below the `md` breakpoint.

## 11. Accessibility

Labelled controls via `boo-input` / `boo-select`; required fields marked; badges carry text, not colour alone; the close button has an `aria-label`; the drawer reuses the existing focus handling; the row name is a clickable element with the branch name as its title.

## 12. Page States

Loading: the table's built-in loading state. Empty: the table's empty row. Load error: toast from the HTTP interceptor, previous rows kept. Saving: button loading state. Deleting: confirmation, then reload. Opening a branch: a spinner overlay while the record loads.

## 13. Edge Cases

- The owner account has no tenant and cannot create branches here (the server rejects it); branches are created from a tenant admin account.
- Creating without a hospital group: the server uses the signed-in user's tenant (see §14).
- Bed and ICU capacity are not part of Create (the API sets them to 0); they are editable after the first save.
- Duplicate names are allowed by the API; codes are generated by the server (sequence tracker).
- Deleting a branch that still has departments or rooms may be refused by the database; the list shows an error toast and keeps the row.

## 14. API Contract

**Existing endpoints used** (`api/hospitals`; JSON enums travel as numbers; `HospitalType` 0 General · 1 Specialty · 2 Teaching · 3 Research · 4 Clinic · 5 Emergency · 6 Rehabilitation):

| Purpose | Method / URL | Notes |
|---|---|---|
| List | `POST /api/hospitals/search` | body `{ pageNumber, pageSize, search, sort, filter: { start, end, … } }`. Only `search`, `start`/`end` and `sort` (`name`, `code`, `createdAt`, e.g. `-createdAt`, `+name`) take effect today. |
| Read | `GET /api/hospitals/{id}` | returns `HospitalViewModel`. |
| Create | `POST /api/hospitals` | `CreateHospitalViewModel`; returns the new id. |
| Update | `PATCH /api/hospitals/{id}` | `UpdateHospitalViewModel` (all fields; includes `bedCapacity`, `icuCapacity`, `is24Hours`, `isActive`). |
| Delete | `DELETE /api/hospitals/{id}` | 204. |

**Backend change made for this page:** `hospitalGroupId` is no longer required on Create / Update. On Create, an empty value falls back to the signed-in user's tenant (the handler previously trusted the client, and the DbContext overwrote it anyway). Update ignored the field already.

**Gaps (not implemented, noted for later):** server-side filters for type / status / emergency; `hospitalGroupName` and `hospitalGroupId` on the view model; a count of departments, rooms and beds per branch to warn before delete.

**Menu row** (create it under the System section; `parentId` is that section's id):

```json
{
  "label": "Hospital",
  "parentId": "<id of the System section row>",
  "icon": "hospital",
  "order": 20,
  "route": "/admin/system/hospital",
  "permissionCode": "admin:hospital:read",
  "isActive": true
}
```

## 15. Performance Considerations

Server paging (page size follows the table height via `TablePageSizeService`), search on the server, no client-side filtering of the full list, drawer content created on open.

## 16. Scalability

The table card and drawer take their data through inputs and emit events, so the same pair can serve a branch picker later. Adding server filters means adding rows to the table's filter configuration; nothing else changes.

## 17. Enterprise Recommendations

- Add the server filters and `hospitalGroupId` / counts listed under Gaps.
- Block deleting a branch that has departments, rooms or active admissions (deactivate instead).
- Audit-log branch create / update / delete (the DbContext already writes audit entries).
- Show per-branch operating hours with a structured editor instead of raw JSON.
