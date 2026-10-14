# Master Data Redesign (database-per-tenant)

Status: **design for review. No code, entity, migration or database has been changed.**
Rewrites the earlier shared-database version of this document (nullable `TenantId` on catalog rows plus a `TenantCatalogConfig` override table). That approach is dropped: with one database per tenant, ownership is expressed by **where the row lives** and by a small set of provenance columns, not by a nullable tenant id.
Companions: `multi-tenant-database-redesign.md` (architecture, identity, routing, provisioning), `implementation-roadmap.md` (phase 6 delivers this document).

---

## 0. Assumptions and decisions to confirm

| ID | Statement | Default | If wrong |
|---|---|---|---|
| MD-01 | Today's catalog rows (dev data) are platform defaults, not customer data. | Export them as the first global catalog version. | Re-classify rows before export (§9). |
| MD-02 | Tenants may add a **display alias** (`LocalName`) to copied catalog rows but may not rename the reference name. | Yes | Drop `LocalName`. |
| MD-03 | Clinical safety fields (e.g. lab reference ranges) are overridable only by a permissioned, audited action. | Yes | Lock them completely. |
| MD-04 | A copied row keeps the **global id as its own `Id`** in the tenant database. | Yes (FK graph copies verbatim) | Use a new id plus `SourceId` mapping. |
| MD-05 | New global entries default to **active** in tenants for reference catalogs and are surfaced in a "Catalog updates" notice for clinical catalogs. | Yes | Per-tenant sync mode `Review` (below) for everything. |
| MD-06 | Insurers and manufacturers start with an **empty or small curated** global list; tenants add their own. | Yes | Drop the global side for those two. |
| MD-07 | Geography is **copied** into each tenant database (read-only), not read from the platform database. | Yes | See the alternative in §3.1. |
| MD-08 | Isolation and sync tests run against real PostgreSQL (Testcontainers), not EF InMemory. | Yes | n/a |

---

## 1. Current state and problems (verified)

- The eight catalogs (`MedicalSpecialty`, `LabTestCategory`, `LabTest`, `ImagingModality`, `AppointmentType`, `InsuranceCompany`, `Manufacturer`, `Supplier`) derive from plain `Entity`: **no tenant column, one shared table for every tenant**. They are managed under `/admin/system/common-category/*`, a tenant-facing area, so a tenant admin edits data every tenant sees.
- `Supplier` carries commercial data (payment terms, credit limit, bank details, tax ids) and `AppointmentType` carries a consultation fee. Both are visible across tenants today.
- `Permission`, `Role`, `RolePermission`, `UserRole`, `AdminMenu` and the four geography tables are also single shared tables. Roles and user-role assignments being global is a security problem (see `multi-tenant-database-redesign.md` §2.4).
- `Sys_SequenceTracker`, `PrintTemplate*`, `Sys_MediaFile`, `Article`, `Sys_Setting` are untenanted as well (listed in the appendix).
- Seeding is plain SQL run by hand (`seed-data.sql`, `seed-geography.sql`); there is no versioning of reference data and no way to distribute a change.
- Code indexes on catalogs are not unique, so duplicates can accumulate.

---

## 2. Classification model

| Class | Name | Source of truth | Lives in | Tenant may |
|---|---|---|---|---|
| **1** | Global reference data | Platform DB | Platform DB only, read through a cached lookup service | Nothing (read) |
| **2a** | Global catalog, copied, immutable | Platform DB | Copy in every tenant DB | Nothing |
| **2b** | Global catalog, copied, with tenant-local settings | Platform DB (reference fields) + tenant (local fields) | Copy in every tenant DB | Edit local fields only; cannot add rows |
| **3** | Tenant-owned | Tenant DB | Tenant DB only (optional one-time starter pack) | Everything |
| **4** | Hybrid: global defaults copied + tenant additions | Platform DB for linked rows; tenant for custom rows | Tenant DB | Edit local fields on linked rows; add and fully own custom rows |

Field groups on a copied row:

| Group | Owner | Tenant UI | Sync behavior |
|---|---|---|---|
| **Reference fields** | Platform | read-only | updated by sync |
| **Controlled-override fields** (clinical safety) | Platform default, tenant may override | needs permission `catalog:override-reference`; audited; "Customized" badge | never overwritten once overridden; a later global change becomes a **field conflict** for review |
| **Local fields** (alias, local code, price, durations, enablement, contacts) | Tenant | editable | never touched by sync |

Escape hatch: **Detach**. A tenant admin may detach a linked row (confirmation, audited). The row becomes fully tenant-owned (`IsDetached = true`), no longer receives sync, and keeps its `SourceId` for history. Detach is one-way.

---

## 3. Ownership matrix (final)

Legend for tenant columns: Add = may create rows; Ref = reference fields editable; Local = local fields editable.

| Catalog | Class | Reasoning | Add | Ref | Local |
|---|---|---|---|---|---|
| Countries | **2a** | Closed, rarely changing, referenced by addresses with FKs and joins. Cross-database FKs are impossible and a request-path lookup into the platform DB is avoided. About 15 k geography rows are a few MB per tenant. | No | No | No |
| Provinces (`City`, first administrative level) | **2a** | as above | No | No | No |
| Districts | **2a** | as above | No | No | No |
| Wards (`GeoWard`) | **2a** | as above; missing places are corrected through a global update, addresses also keep free text | No | No | No |
| Medical specialties | **4** | A standard list exists, but hospitals need local specialties. Doctors reference specialties historically. | Yes | No (Detach) | alias, enabled, average consultation duration |
| Lab test categories | **4** | Standard grouping plus local departments' groupings | Yes | No (Detach) | alias, enabled |
| Lab tests | **4** | Standard test catalog plus custom tests; price and turnaround are commercial/operational | Yes | No (Detach); normal ranges and unit are **controlled-override** | alias, local code, enabled, cost, urgent cost, home collection charge, reporting times, urgent/home flags, appointment flag |
| Imaging modalities | **2b** | Closed standard list; hospitals only tune availability and scheduling | No | No | alias, local code, enabled, average duration, preparation text |
| Appointment types | **3** | Entirely operational (fees, durations, colors). Seeded once from a versioned **starter pack**; no sync, no `SourceId`. | Yes | n/a | all |
| Insurance companies | **4** | National insurers can be global defaults (filtered by country); contract terms are per hospital | Yes | No (Detach) | contract terms, contacts, coverage limits, network, enabled |
| Manufacturers | **4** | Regulatory identity is shareable; contact and relationship data is local | Yes | No (Detach) | contact details, enabled |
| Suppliers | **3** | Commercial relationship, tax and bank data; must never be shared | Yes | n/a | all |
| Permissions | **2a** | Code-owned definitions; tenants grant them through roles but cannot create or edit them. Platform-only permissions (`platform:*`, `catalog:global:*`) are never copied. | No | No | grants via `RolePermission` |
| Roles | **2a + 3** | System roles are copied and locked; tenants may add custom roles | custom only | No | custom roles |
| Administrative menus | **2a** | Platform-defined navigation; visibility derives from the permission each item requires | No | No | No |

Alternative recorded for geography (MD-07): keep it in the Platform DB (class 1), drop the FKs, and resolve names through a cached lookup. Rejected for now because current code joins to geography and the refactor is large; revisit only if tenant database size or seeding time becomes a problem.

### 3.1 Why not nullable `TenantId` plus an override table

It would put every tenant's rows, commercial data included, into one shared table, keep cross-tenant visibility rules in query filters (the failure mode found in the audit), and require a polymorphic override table. With a database per tenant the copy is the override mechanism.

### 3.2 Other catalog-like data found in the code

| Data | Today | Target class | Note |
|---|---|---|---|
| `MedicineCategory`, `Medicine` | `TenantEntity` | **3** | Already tenant data. A global formulary is a separate future decision. |
| `Department`, `Room`, `WarehouseZone` | `TenantEntity` | **3** | Organizational units. |
| `PrintTemplate`, `PrintTemplateVersion` | untenanted | **4** | Platform default templates copied; tenants customize through versions. `PrintLog` is tenant data. |
| `Sys_SequenceTracker` | untenanted | **3** (rules seeded from a starter pack) | Counters become per tenant. |
| `Sys_Language`, `Sys_Resource` | untenanted | **1** | Interface strings; no FKs from clinical data; platform DB with cache. |
| `Sys_Setting`, `SystemSetting` | untenanted | split | Platform configuration in Platform DB; tenant settings in tenant DB. |
| `SubscriptionPlan` | untenanted | **1** | Platform DB. |
| `Article`, `Sys_MediaFile` | untenanted | **3** | Tenant content. Media public ids prefixed `tenants/{tenantId}/`. |

---

## 4. Data design

### 4.1 Platform DB (source side)

- One typed `Global*` source table per class 2/4 catalog (same shape as the tenant table minus tenant-local fields), reusing the entity types where practical. No generic JSON catalog.
- Common columns: `Id` (stable, becomes `SourceId`/tenant `Id`), natural key `Code`, `IsActive`, `IntroducedInVersion`, `ChangedInVersion`, `DeprecatedInVersion?`, `ReplacedById?`.
- `GlobalCatalogVersion(CatalogType, Version, Status Draft|Published, PublishedAt, PublishedBy, ChangeSummary)`. Versions are monotonic per catalog and immutable once published.
- `CatalogDistributionRun(CatalogType, Version, Cohort, StartedAt, Status)` and per-tenant `TenantCatalogVersion(TenantId, CatalogType, AppliedVersion, Status, LastError)`.

### 4.2 Tenant DB (copy side)

Columns added to class 2b and 4 catalog tables:

| Column | Meaning |
|---|---|
| `Origin` | `Global` or `Tenant` |
| `SourceId` | global id (null for tenant-origin rows); equals `Id` for copies (MD-04) |
| `SourceVersion` | catalog version at which the reference fields were last synced |
| `IsDetached` | tenant took ownership; sync skips the row |
| `OverriddenFields` | text array of controlled-override fields the tenant changed |
| `LocalName`, `LocalCode` (where applicable) | tenant alias and code |
| `DeprecatedAt` | set when the global entry is deprecated |

Tenant tables: `CatalogSyncState(CatalogType, AppliedVersion, SyncMode Auto|Review, LastSyncAt, Status)`, `CatalogSyncConflict(Id, CatalogType, SourceId, Kind, GlobalPayload, TenantRowId?, Status Open|Resolved, Resolution, ResolvedBy, ResolvedAt)`, `CatalogSyncProposal` (only used in `Review` mode).

Indexes (per tenant database, so no tenant column is needed):
- Unique `Code` where not deleted (per catalog; lab tests use `TestCode`). A duplicate-code pre-check report runs before the index is enforced (§9).
- Unique `SourceId` where not null.
- Display uses `COALESCE(LocalName, Name)`.

Class 3 and tenant-origin rows have no provenance columns beyond `Origin = Tenant`.

### 4.3 Write guards

- The tenant app role has `SELECT` only on class 2a tables, so tenants cannot change them even through a bug.
- Application layer: rows with `Origin = Global` and not detached reject edits to reference fields (domain method, not UI only).
- Platform writes happen only through the platform context under platform authorization.

---

## 5. Distribution and synchronization

### 5.1 When data reaches a tenant

- **Provisioning (step 5):** copy only the catalogs the tenant needs (geography; permissions; menus; system roles; class 2b/4 catalogs; insurers filtered by the tenant's country). Insert-if-missing by `SourceId`, then write `CatalogSyncState` with the applied version. A retry changes nothing.
- **Starter packs (class 3):** appointment types, sequence rules and default print layouts are inserted once from the pack version recorded in the provisioning step. Later pack versions are not pushed.
- **Later versions:** `CatalogDistributionRun` per published version, by cohort (internal, pilot, general), with a concurrency cap, same orchestration pattern as schema migrations.

### 5.2 Algorithm per tenant per catalog (one transaction, idempotent)

For each global change with `ChangedInVersion > applied` and `<= target`, in dependency order (parents before children, categories before tests):

| Situation | Action |
|---|---|
| No tenant row with this `SourceId`, no natural-key clash | Insert the copy. `IsActive` per MD-05. Record a "new entries" notice for clinical catalogs. |
| No tenant row with this `SourceId`, **tenant row with the same code exists** | **Code collision conflict.** Insert nothing. Resolutions: **Link** (adopt the tenant row: set `SourceId`/`Origin = Global`, keep its local fields), **Keep both** (insert the copy under a prefixed code), **Ignore**. |
| Linked row, not detached | Update **reference fields** except those in `OverriddenFields`; update `SourceVersion`. Local fields untouched. |
| Linked row, a changed reference field is in `OverriddenFields` | Keep the tenant value; open a **field conflict** showing both values (resolve: keep override, accept global, or detach). |
| Global entry **deprecated** | Set `DeprecatedAt` and `IsActive = false` on the linked row unless detached. Never delete. Historical records still resolve. `ReplacedById` is shown as a suggestion only; nothing is re-pointed automatically. |
| Linked row is detached | Skip; record an informational notice. |
| Parent (`ParentSpecialtyId`, `CategoryId`) missing in tenant | Defer the child; log a sync error for the run (retried next run). Cycles are rejected at publication time. |

Finally set `CatalogSyncState.AppliedVersion` and `TenantCatalogVersion`. Nothing a tenant customized is ever overwritten silently: local fields are outside the update set by construction, controlled overrides are tracked, detached rows are skipped.

### 5.3 Review mode

Per tenant per catalog, `SyncMode = Review` stages changes as `CatalogSyncProposal` rows instead of applying them. A tenant admin approves or rejects each (or accepts all). Default is `Auto`. Conflicts always require a decision in both modes; unresolved conflicts never block new orders.

### 5.4 Publishing a global change

1. SuperAdmin edits entries (creates a draft).
2. Validation: unique codes, parent graph acyclic, referenced categories exist, deprecation rather than deletion.
3. Publish creates the next version (immutable).
4. Distribute by cohort; the platform page shows version by tenant, failures and open conflicts.

### 5.5 Lifecycle and historical references

| State | Meaning | New orders | Historical records |
|---|---|---|---|
| Active | normal | selectable | resolve |
| Deprecated (`DeprecatedAt`, inactive) | removed from the standard list | hidden | resolve |
| Tenant-deactivated | tenant switched it off (`IsActive`) | hidden | resolve |
| Soft-deleted | only for tenant rows never referenced | hidden | n/a |

Rules: the global catalog has **no delete**; deprecation only. Foreign keys stay `Restrict` (already applied globally). A tenant row referenced by any clinical record cannot be soft-deleted; it can only be deactivated. Catalog rows are never hard-deleted by sync or by catalog deletion, so clinical records cannot cascade.

---

## 6. Authorization

- Platform: `catalog:global:read|create|update|deprecate|publish|distribute` (SUPER_ADMIN and delegated platform roles). Never copied into tenant databases.
- Tenant: `catalog:read`, `catalog:local:update`, `catalog:custom:create|update|deactivate`, `catalog:override-reference`, `catalog:sync:review`, `catalog:detach`. The existing per-catalog permissions (for example `lab:lab-test:update`) keep applying to custom and local edits.
- A tenant request can only reach its own database, so there is no cross-tenant read to guard against inside handlers; handlers still reject edits to locked fields (domain rule).
- Foreign ids simply do not exist in another tenant's database (404, no existence leak).

---

## 7. API contract (proposed; backend not implemented)

Platform (SUPER_ADMIN, platform audience):

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| List global entries | POST | `/api/platform/catalogs/{type}/search` | paged filter (status, version) | paged items | SuperAdmin catalog list |
| Create/update draft entry | POST / PUT | `/api/platform/catalogs/{type}[/{id}]` | payload + row version | id / 204 / 409 | drawer |
| Deprecate / restore | PATCH | `/api/platform/catalogs/{type}/{id}/status` | `{isActive, replacedById?}` | 204 | row action |
| Publish | POST | `/api/platform/catalogs/{type}/versions` | `{summary}` | `{version}` | publish dialog |
| Distribute | POST | `/api/platform/catalogs/{type}/versions/{v}/distribute` | `{cohort}` | `{runId}` (202) | distribution page |
| Distribution status | GET | `/api/platform/catalogs/{type}/versions/{v}/status` | none | per-tenant status, failures, open conflicts | distribution page |
| History | GET | `/api/platform/catalogs/{type}/{id}/history` | none | audit entries | history tab |

Tenant (tenant audience):

| Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|
| Effective list | POST | `/api/catalogs/{type}/search` | filter incl. `origin` (global/custom/all), `status` | rows with provenance badges | tabs and pickers |
| Edit local fields | PUT | `/api/catalogs/{type}/{id}/local` | local fields | 204 | config drawer |
| Override reference field | PUT | `/api/catalogs/{type}/{id}/override` | `{field, value, reason}` | 204 | drawer (guarded) |
| Detach | POST | `/api/catalogs/{type}/{id}/detach` | `{reason}` | 204 | row menu |
| Custom CRUD | POST/PUT/DELETE | `/api/catalogs/{type}[/{id}]` | payload | id / 204 | custom tab |
| Updates inbox | GET | `/api/catalogs/sync/inbox` | none | proposals, conflicts, new-entry notices | "Catalog updates" panel |
| Resolve conflict | POST | `/api/catalogs/sync/conflicts/{id}/resolve` | `{resolution}` | 204 | conflict dialog |
| Approve proposals | POST | `/api/catalogs/sync/proposals/approve` | `{ids \| all}` | 204 | inbox |
| Sync mode | PUT | `/api/catalogs/{type}/sync-mode` | `{mode}` | 204 | settings |

Existing routes (for example `api/lab-tests`) keep working and delegate to the same handlers during the transition. Request bodies never carry a tenant id.

---

## 8. UX specification (summary; frontend phase)

**Information architecture**
- SuperAdmin `/superadmin/master-data`: catalog hub, list, draft/publish, distribution status (version × cohort), conflicts overview.
- Tenant `/admin/system/common-category/{type}`: tabs **Standard** (linked rows) and **Custom**; provenance badge on every row: Standard, Custom, Customized, Detached, Deprecated; a "Catalog updates" panel with a count badge.

**User journeys**
- SuperAdmin: edit draft, validate, publish, pick cohort, watch distribution, handle failures.
- Tenant admin: see new standard entries, adjust local price/alias, resolve a code collision, detach a row, review proposals.

**States:** skeleton while loading; empty ("No standard entries yet"); error with retry; success toast; disabled actions carry a tooltip ("Managed by the platform"); conflict state with side-by-side values.
**Confirmations:** deprecate, detach (one-way), override of clinical fields (reason required), accept-all proposals.
**Layout:** reuse the existing `*-table-card`, `*-drawer`, `boo-button-admin`, status badges and drawer; new shared pieces limited to `CatalogSourceBadge`, `CatalogConflictDialog` and `CatalogUpdatesPanel`. Sticky drawer header and footer; desktop first; tabs collapse to a select on mobile; 44 px touch targets.
**Accessibility (WCAG AA):** badges carry text, not colour alone; dialogs trap and restore focus; Esc closes drawers; the diff view is readable by screen readers (labelled old/new values).
**Performance:** server pagination, debounced search, per-tenant picker cache invalidated by sync completion; sync runs in the background and never blocks requests.

---

## 9. Pre-checks before the catalog migration (documentation of the later step)

No migration is run in this task. Before the tenant and platform baselines are generated:

1. Export the current rows of the eight catalogs, roles, permissions and menus from the development database (`pg_dump` data-only of those tables). The export becomes global catalog version 1 (MD-01).
2. Report, without deleting anything: duplicate codes (case and whitespace insensitive), null codes, orphan foreign keys (`LabTest.CategoryId`, `ParentSpecialtyId`), parent cycles, rows referenced by clinical tables, rows that look tenant-specific (suppliers with bank data, appointment types with fees) that should become starter packs rather than global defaults.
3. Classify each flagged row (global default, starter pack, discard) with the owner.
4. Only then enforce the unique code indexes.
5. Rollback: the baselines are new; the old development database and the export remain untouched until the owner approves removal.

---

## 10. Edge cases and scalability

- A tenant creates a custom code equal to a later global code: **code collision** workflow, never an overwrite.
- A global entry is deprecated while linked rows are referenced: stays resolvable, hidden for new orders.
- A tenant detaches a row, then the global entry is deprecated: no change for that tenant (notice only).
- Sync interrupted midway: the transaction per tenant and catalog rolls back; the next run resumes from the recorded applied version.
- A tenant in `Maintenance` or `MigrationFailed` is skipped and retried; schema must be at least the version that contains the provenance columns.
- A new tenant is provisioned while a version is being distributed: provisioning copies the latest published version and records it, so distribution skips it.
- Size: 500 tenants × tens of thousands of reference rows is small; distribution cost is bounded by cohort concurrency.

## 11. Enterprise recommendations

- Remove the unauthenticated query-filter bypass and review every `IgnoreQueryFilters()`; tenant context mandatory (architecture document).
- Tests (phase 9, PostgreSQL via Testcontainers): sync inserts only missing rows; sync never overwrites local fields or overridden fields; code collision creates a conflict; deprecation keeps historical resolution; detached rows are skipped; idempotent re-run; provisioning seeds exactly the required set and is retryable; tenant app role cannot write class 2a tables; platform permission codes are never present in a tenant database; global changes do not cascade into clinical rows.
- Audit: every publication, distribution run, override, detach and conflict resolution is written to the platform or tenant audit log.
