# Master Data Management Redesign

Status: design (assumptions in §0 not yet confirmed by the owner). Companion to `superadmin-platform-redesign.md`.

## 0. Assumptions (change here first if wrong)

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | Every existing catalog row is shared reference data and becomes **global** (`TenantId = NULL`). | Tenant-specific rows (e.g. a tenant's own suppliers) would become visible to all tenants. Backfill rule in §6 must be changed to assign owners. |
| A2 | A missing `TenantCatalogConfig` row means the global entry is **enabled** for the tenant. | New global entries would need an explicit enable step. |
| A3 | Tenants may override price/operational fields of global LabTest/ImagingModality via config. Display names are **not** overridable. | Drop `Settings` price keys. |
| A4 | Isolation tests run against real PostgreSQL (Testcontainers). | Partial indexes and query filters are not faithfully testable on EF InMemory. |

## 1. UX Audit & Current Problems

- The eight catalogs live under `/admin/system/common-category/*`, which is tenant-facing, so a tenant admin edits data that every tenant sees.
- All eight entities derive from plain `Entity` (no `TenantId`), so ownership is not recorded anywhere.
- Code indexes are `IsUnique(false)`, so duplicates accumulate.
- `/superadmin/master-data` exists but does not own the catalogs.
- The global query filter has an `!IsAuthenticated` bypass; `IgnoreQueryFilters()` is used in background jobs without a documented system context.
- Nothing in the UI tells a user whether a row is shared, owned, or configured.

## 2. Ownership Matrix

| Catalog | Model | Maintained by | Tenant can add | Tenant-configurable | Referenced by | Global deactivated / updated |
|---|---|---|---|---|---|---|
| LabTestCategory | Global | Platform | No | enable only | LabTest.CategoryId | Deactivate: hidden from pickers, history intact. Update: visible to all. |
| LabTest | Hybrid | Platform + tenant | Yes (custom) | enable, local code, Cost/UrgentCost/HomeCollectionCharge, ReportingTimeHours | LabOrderItem.LabTestId | Same; tenant config row retained. |
| ImagingModality | Global | Platform | No | enable, local code | ImagingOrder.ModalityId | Same |
| MedicalSpecialty | Global | Platform | No | enable | DoctorSpecialty.SpecialtyId | Same |
| AppointmentType | Tenant-owned | Tenant | Yes | all fields | Appointment.AppointmentTypeId | n/a (no global rows) |
| InsuranceCompany | Hybrid | Platform + tenant | Yes (custom) | enable, local code, contract settings | InsuranceClaim/Bill.InsuranceCompanyId | Same |
| Manufacturer | Global | Platform | No | enable | Medicine.ManufacturerId | Same |
| Supplier | Tenant-owned | Tenant | Yes | all fields | MedicineInventory.SupplierId | n/a |

Rules common to all: delete is soft-delete or `IsActive=false`; FKs stay `Restrict`; inactive entries are excluded from new-order pickers but still resolve on historical records.

## 3. Data Design

**Catalog entities (global / hybrid / tenant-owned)** gain `Guid? TenantId` (+ `Version int`). `NULL` = global.
- Only Hybrid and Tenant-owned catalogs expose tenant writes; Global-only catalogs reject any non-null `TenantId` in the application layer.
- Read filter: `DeletedAt == null && (TenantId == null || TenantId == currentTenant)`.
- Write guard (DbContext): saving a row with `TenantId == null` requires the platform context; saving a row with `TenantId != null` requires `TenantId == currentTenant`. `TenantId` is never taken from a request body.
- Unique indexes: `(Code) WHERE TenantId IS NULL AND DeletedAt IS NULL` and `(TenantId, Code) WHERE TenantId IS NOT NULL AND DeletedAt IS NULL`.

**`TenantCatalogConfig`** (new, `TenantEntity`):
`Id, TenantId, CatalogType (enum), GlobalRecordId, IsEnabled, LocalCode, Settings (jsonb), GlobalVersionSeen, audit columns`.
Unique `(TenantId, CatalogType, GlobalRecordId)`. Existence of `GlobalRecordId` is validated in the application layer (polymorphic reference, so no DB FK). Global updates never write to this table.

**Effective view:** `global row LEFT JOIN config` per tenant; custom rows are returned as-is. Exposed as a query, not a copied table.

## 4. Provisioning

`RegisterTenant` adds an idempotent step `EnsureTenantCatalogDefaults` inside the existing transaction. It inserts nothing for global catalogs (A2). Tenant-owned defaults (AppointmentType starter set) are upserted on `(TenantId, Code)`, so a retry creates no duplicates. A client-supplied idempotency key on `RegisterTenant` prevents double tenant creation. New global entries reach existing tenants automatically.

## 5. Authorization

- New permissions: `catalog:global:read|create|update|deactivate` (SUPER_ADMIN only) and `catalog:config:read|update` (tenant admin).
- Existing per-catalog tenant permissions (e.g. `lab:lab-test:update`) apply only to tenant-owned rows; the handler returns 403/404 for a global or foreign row.
- Foreign-tenant IDs resolve to 404 via the query filter, not 403, to avoid existence leaks.

## 6. Migration Plan (non-destructive)

1. Add nullable `TenantId`, `Version` to the eight tables. Existing rows stay `NULL` (A1).
2. Create `TenantCatalogConfigs`.
3. Add the partial unique indexes. **Pre-check:** query for duplicate codes among existing rows; the migration aborts with a report instead of deleting anything.
4. Register new permissions and grant them idempotently in seed SQL.
5. Rollback: drop the new columns/table; no existing data is modified.

## 7. API Contract (proposed)

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| List global entries | POST | `/api/platform/catalogs/{type}/search` | `PagedRequest<filter>` | `PagedResult<GlobalCatalogItem>` | SuperAdmin list |
| Create global | POST | `/api/platform/catalogs/{type}` | catalog payload | `Guid` | SuperAdmin drawer |
| Update global | PUT | `/api/platform/catalogs/{type}/{id}` | payload + `version` | 204 / 409 on stale version | SuperAdmin drawer |
| Activate/deactivate | PATCH | `/api/platform/catalogs/{type}/{id}/status` | `{isActive}` | 204 | row action |
| History | GET | `/api/platform/catalogs/{type}/{id}/history` | – | audit entries | history panel |
| Tenant effective list | POST | `/api/catalogs/{type}/search` | filter + `source` (global/custom/all) | rows with `source`, `isEnabled`, `localCode`, `settings` | tenant tabs, pickers |
| Configure global entry | PUT | `/api/catalogs/{type}/{globalId}/config` | `{isEnabled, localCode, settings}` | 204 | config drawer |
| Tenant CRUD (own rows) | POST/PUT/DELETE | `/api/catalogs/{type}[/{id}]` | payload | as above | Custom tab |

Existing routes (e.g. `api/lab-tests`) keep working for backward compatibility and delegate to the tenant endpoints.

## 8. Information Architecture, Layout, Components

- **SuperAdmin `/superadmin/master-data`:** hub of catalogs → list (table, filters, status badge, version) → drawer → history tab.
- **Tenant `/admin/system/common-category/{type}`:** tabs **Global** (read-only rows, enable switch, "Configure" drawer) · **Custom** (existing CRUD) · rows show a source badge (Global / Custom / Configured).
- Reuse: existing `*-table-card`, `*-drawer`, `boo-button-admin`, drawer, status badges. New shared pieces only: `CatalogSourceBadge` and `CatalogConfigDrawer`.

## 9. Interaction, States, Accessibility, Responsive

- States: skeleton loading, empty ("No global entries available"), error with retry, success toast, disabled actions with tooltip explaining why (e.g. "Managed by platform").
- Deactivation and disable require a confirmation dialog stating historical records are unaffected.
- Version conflict (409) shows a "changed by someone else, reload" prompt.
- Keyboard: tab order list → drawer; Esc closes drawers; switches are labelled; badges carry text, not colour alone (WCAG AA).
- Desktop first; tabs collapse to a select on mobile; 44px touch targets.

## 10. Performance, Scalability, Edge Cases

- Server pagination and debounced search; effective-view query indexed on `(TenantId, CatalogType, GlobalRecordId)`.
- Cache pickers per tenant, invalidated on global update or config change.
- Edge cases: tenant creates a custom code equal to a global code (allowed, different index scope; UI warns); global entry deactivated while enabled for tenants (stays resolvable, hidden in pickers); config row for a deleted global record (ignored, cleaned by job); background jobs run in an explicit system context instead of an unauthenticated bypass.

## 11. Enterprise Recommendations

- Remove the `!IsAuthenticated` filter bypass and review every `IgnoreQueryFilters()` call.
- Add integration tests: SuperAdmin global CRUD; tenant cannot modify global; tenant A cannot read or write tenant B by guessed ID; config isolation; global update preserves config; deactivation keeps history; provisioning idempotency; API-level 403; migration preserves rows.
- Add a migration pre-check report for duplicate codes before enforcing uniqueness.
