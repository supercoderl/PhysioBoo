# Backend Module Checklist

Tracks the frontend-only modules that need a backend in `physio-server`, and the recipe for building each one.
Reference implementation: **MedicalService** (`cms/service`). Read it before starting a new module.

Status legend: ⬜ not started · 🟡 in progress · ✅ done

## 1. Module tracker

| #   | Module              | Frontend path             | Status | Notes                                                                                                                |
| --- | ------------------- | ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Academy             | academy/list              | ✅     | Built and migrated (`New_Modules_V2`). **Ops:** assign `academy:course:manage` to managers. |
| 2   | Home Configuration  | cms/home-configuration    | ✅     | Home Settings plus banners, features and testimonials (`/api/home-banners`, `/api/home-features`, `/api/home-testimonials`). |
| 3   | CMS Service         | cms/service               | ✅     | Create/Duplicate now save department and doctor links (`SaveLinksAsync`). |
| 4   | Lead Management     | crm/lead-management       | ✅     | Migrated. |
| 5   | Marketing Campaign  | crm/marketing-campaign    | ✅     | Migrated; `CMP-` sequence seeded; audience segments are built in (`/api/audience-segments/lookup`, counted live). |
| 6   | Member Points       | crm/member-point          | ✅     | Migrated; `MEM-`, `TXN-`, `RWD-` sequences seeded. |
| 7   | Support / Complaint | crm/support-complaint     | ✅     | Migrated; `CPL-` sequence seeded. |
| 8   | Finance Reports     | finance/report            | ✅     | Delivered earlier (RevenueReportEndpoints). |
| 9   | Admission           | inpatient/admission       | ✅     | Migrated; `ADM-` sequence seeded. |
| 10  | Bed Map             | inpatient/bed-map         | ✅     | "Wards & beds" drawer on the map creates/deletes wards and beds. |
| 11  | Treatment Sheet     | inpatient/treatment-sheet | ✅     | New order and schedule-dose forms; Export PDF prints via the browser (Save as PDF). |
| 12  | Nursing Dashboard   | nursing/dashboard         | ✅     | "Assign patient" panel creates nursing assignments. |
| 13  | Nursing Handover    | nursing/handover          | ✅     | `PATCH /api/nursing/handover/{id}` edits SBAR until the card is acknowledged. |
| 14  | Surgery             | paraclinical/surgery      | ✅     | `SUR-` sequence seeded; printable consent form. **Ops:** assign `surgery:*` permissions. |
| 15  | Reception Queue     | reception/queue           | ✅     | No backend needed. |
| 16  | Notes               | system/note               | ✅     | Login only by design (personal notes). |
| 17  | Scrumboard          | system/scrumboard         | ✅     | Columns drag to reorder (`POST /api/scrumboard/lists/{id}/move`). |
| 18  | Laboratory          | paraclinical/laboratory   | ✅     | `/api/laboratory/*`: orders (`LAB-`), sample tracking, results with range flags, verification, panic-value alerts. Orders are placed from the Medical Record. |
| 19  | Radiology           | paraclinical/radiology    | ✅     | `/api/radiology/*`: orders (`RAD-`), scheduling, modality queue, studies, reporting with templates and critical-finding alerts. |
| 20  | Dashboard           | overview/dashboard        | ✅     | `/api/dashboard/overview` aggregates every module; alerts dismiss at their source; CSV export. |
| 21  | Settings            | system/settings           | ✅     | Account (`/api/users/me/account`), Security (password, sessions), Team (invites, roles), Billing (`/api/billing/me/*`). |

Migrations: `20261006150900_New_Modules_V2` (modules 1–17) and `20261007075826_Workspaces_Lab_Radiology_Cms` (home content, lab/radiology workflow, alerts, session device info; backfills statuses of existing lab items and imaging reports).

**Not in source control:** the PostgreSQL functions the repositories call (`get_identifier_for_login`, `get_owner_permission_codes`, `get_users_dynamic`, … 15 in total) exist only in the team database. A fresh database cannot log in until they are added; export them (`pg_dump --schema-only`) into a migration.

## 2. Prompt to start a new session

Copy, fill the two placeholders, paste as the first message:

```
I am building the backend for <MODULE>.
I write the code myself. You are my mentor: do NOT create or edit any source
file in physio-server or physio-app unless I explicitly ask you to write it.

Follow docs/backend-module-checklist.md. First read the frontend service, types and the
BASE_API entry so the routes and JSON shapes match what Angular already sends.

Then guide me one checklist section at a time (Domain, Infrastructure,
Application, Presentation, Migration, Frontend):
- For each file, tell me the exact path, what it must contain, and show the
  code as a snippet in chat for me to copy.
- Wait for me to say the section is done. Then read my files, check them
  against the checklist and gotchas, and list every problem you find. Tell me
  how to fix each one. Do not fix it for me.
- Do not run builds, tests, migrations or database updates unless I ask.
- Warn me about the gotchas in section 4 before I hit them.
```

If you ever want the AI to write a specific file, say so in that message
("write step X for me") and it may edit files for that step only.

## 3. Per-module checklist

Copy this block into the module's notes and tick it off. Paths are under `physio-server/`.

### Discovery

- [ ] Read the frontend component, drawer/table components, service, and `shared/types/*.types.ts`.
- [ ] Read the `BASE_API.<MODULE>` entry in `physio-app/src/app/shared/api/base.ts`.
- [ ] List every endpoint the frontend calls, with method, route, request and response shape.
- [ ] Check whether an entity or table already exists (`PhysioBoo.Domain/Entities`).

### Domain (`PhysioBoo.Domain`)

- [ ] Enums: one file per enum in `Enums/`.
- [ ] Entity in `Entities/<Area>/`, inheriting `TenantEntity`, private setters plus `SetX` methods.
- [ ] Join entities for many-to-many links.
- [ ] `Interfaces/Repositories/I<Name>Repository.cs`.
- [ ] Error codes in `Errors/DomainErrorCodes.cs`.
- [ ] Permissions in `Constants/Permissions.cs` (the seeder picks them up by reflection).
- [ ] **No DTOs or view models in Domain.**

### Infrastructure (`PhysioBoo.Infrastructure`)

- [ ] `Configuration/<Name>Configuration.cs` in the layout: Naming, PK, Indexes, Relationships, Properties. List every property.
- [ ] Configurations for join tables, with `using PhysioBoo.Domain.Entities.<Area>;`.
- [ ] `Database/ApplicationDbContext.cs`: `DbSet` and `ApplyConfiguration` lines.
- [ ] `Repositories/<Name>Repository.cs`.
- [ ] Register the repository in `Extensions/ServiceCollectionExtensions.cs`.

### Application (`PhysioBoo.Application`)

- [ ] View models in `ViewModels/<Name>/`: filter, create, update, view model, stats.
- [ ] Sort provider in `SortProviders/`, registered in `Extensions/ServiceCollectionExtensions.cs` (add the `using` too).
- [ ] Queries in `Queries/<Name>/`: GetAll (+ `SearchSpec`), GetById, GetStats if the UI has KPIs.
- [ ] Commands in `Commands/<Name>/<Action>/`: Command, CommandHandler, CommandValidation.
- [ ] Every handler that returns names or links loads them with `Include` (see gotchas).

### Presentation (`PhysioBoo.Presentation`)

- [ ] `Endpoints/<Name>Endpoints.cs`, mapped in `Program.cs`.
- [ ] Write endpoints return `ResponseMessage<Guid>` (not `NoContent`), because the frontend reads `res.success`.
- [ ] Every endpoint has `RequireAuthorization(Permissions...)`.

### Migration

- [ ] `dotnet build physio-server.sln` succeeds.
- [ ] `dotnet ef migrations add <Name> -p PhysioBoo.Infrastructure -s PhysioBoo.Presentation -c ApplicationDbContext`
- [ ] Read the generated migration. Check it contains only this module's changes.
- [ ] Apply it (`dotnet ef database update ...`) only after the check above.

### Frontend and docs

- [ ] Frontend service, `BASE_API` routes and types match the backend.
- [ ] Lookup dropdowns (departments, doctors, ...) are filled from real services.
- [ ] `docs/<feature>-redesign.md` still matches the implemented UI (CLAUDE.md rule).
- [ ] Smoke test in Swagger, then in the UI.

## 4. Gotchas learned on MedicalService

1. **`InsertAsync<T,TKey>` writes with raw Dapper SQL and saves immediately.** It ignores EF navigation collections, so join rows are not saved. After a successful insert, add the join entities through the `DbContext` and call `SaveChangesAsync`.
2. **`UpdateTrackedAsync` saves by itself.** `SoftDeleteSingle` does not. Call `CommitAsync()` after it.
3. **No lazy-loading proxies.** Any view model that shows a related name needs `Include`/`ThenInclude`, in both the repository `GetWithLinksAsync` and the `SearchSpec`. Otherwise the field is silently null.
4. **Use `GetWithLinksAsync` for update, duplicate and get-by-id.** Plain `GetByIdAsync` loads no links.
5. **No `JsonStringEnumConverter` is configured.** Request view models take enums as `string`. Parse with `Enum.TryParse(value, true, out var x)` in the handler. Store enums with `HasConversion<string>()`.
6. **Keep JSON-in-a-column formats consistent.** `Tags` is written with `JsonSerializer` everywhere. A `string.Join` in one handler broke reads in another.
7. **`SortQuery` lowercases the sort key**, so dictionary keys in the sort provider are lowercase (`updatedat`).
8. **Archived or deleted records are hidden by default** in the search spec unless the status filter asks for them.
9. **Soft-delete query filters on `Department` and `Doctor`** make EF warn about required navigations from join tables. View models must use `?.` on those navigations.
10. **`dotnet ef migrations add` diffs the whole model.** It can pick up older unmigrated changes. Read the file before applying.
11. **Presentation has global usings** for `Microsoft.AspNetCore.Mvc`, `PhysioBoo.Domain.Constants` and `PhysioBoo.SharedKernel.Common`. Application does not import `PhysioBoo.Domain.Enums` or EF Core globally, so add those `using`s in files that need them.
12. **Solution file is `physio-server.sln`**, not `PhysioBoo.sln`.
13. **Queries are no-tracking by default** (`UseQueryTrackingBehavior(NoTrackingWithIdentityResolution)` in `Program.cs`). Load an entity you will change with `.GetAll(...).AsTracking()`; otherwise `CommitAsync()` saves nothing and still reports success.
14. **Bus event constructors must match properties.** Every constructor parameter of an event sent over RabbitMQ needs a property of the same name (the id parameter is `aggregateId`), or the consumer fails to deserialize it.
15. **Computed properties need `[NotMapped]`.** `InsertAsync` reflects over public properties, so a getter-only property like `FullName` becomes a non-existent column.

## 5. Reference: MedicalService file map

| Layer          | Files                                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain         | `Entities/Operation/MedicalService.cs`, `Enums/ServiceStatus.cs`, `Enums/ServiceAvailability.cs`, `Interfaces/Repositories/IMedicalServiceRepository.cs`                                                              |
| Infrastructure | `Configuration/MedicalService*Configuration.cs` (3 files), `Repositories/MedicalServiceRepository.cs`, migration `20260923145328_MedicalService`                                                                      |
| Application    | `ViewModels/MedicalServices/*`, `SortProviders/MedicalServiceViewModelSortProvider.cs`, `Queries/MedicalServices/{GetAll,GetById,GetStats}`, `Commands/MedicalServices/{Create,Update,ChangeStatus,Delete,Duplicate}` |
| Presentation   | `Endpoints/MedicalServiceEndpoints.cs`                                                                                                                                                                                |
| Frontend       | `pages/admin/cms/service/service.component.ts`, `services/admin/medical-service.service.ts`                                                                                                                           |
