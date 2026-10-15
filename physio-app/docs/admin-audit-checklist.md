# Admin Audit Checklist

Audit of the whole `/admin` section: frontend routes, services, backend endpoints, handlers and seed data.
Started 2026-10-15. This file is the persistent progress record; update it as modules are verified.

## How this audit was run (and its limits)

| Check | Method | Evidence |
| --- | --- | --- |
| Every frontend HTTP call resolves to a backend route with the same method | Script: evaluates `BASE_API`, parses all `Map*` routes | 517 calls vs 578 routes |
| Typed request bodies vs backend view-model fields | Script (field-name comparison; `any`-typed bodies and `Omit<>` aliases are not resolved) | manual follow-up on every hit |
| Endpoints answering `204 No Content` whose frontend consumer reads `.success` | Script over 26 service classes | 2 hits, fixed |
| Sort strings the backend cannot parse | grep + unit tests | 19 call sites, fixed in parser |
| Frontend enums mirror backend enums (JSON enums travel as numbers) | Script | 21 enums compared, no value drift |
| Permission codes: backend constants vs seed vs frontend | Script | 274 / 274 / 165, no gaps |
| Sequence-tracker types used by create handlers vs seed | Script | 22 / 22 |
| Menu seed routes vs Angular routes | Manual | all 36 resolve |
| Anonymous endpoints | Script over every `Map*` | reviewed, 1 leak fixed |
| DI registrations for injected custom interfaces | Script | 166 declared, 164 registered, none injected-but-unregistered |
| Frontend compile | `tsc --noEmit -p tsconfig.app.json` (629 files) and `ngc --noEmit` (templates) | clean (template warnings only) |
| Backend compile | `dotnet build PhysioBoo.Presentation` into a scratch OutDir | succeeded |
| Backend tests | `dotnet test PhysioBoo.Application.Test` | see run log in final summary |

Verification levels used below:

* **LIVE** = executed against a running API on a throw-away PostgreSQL (own port and data directory; the development
  database was never touched) with the persisted rows checked in SQL. Scripts: `physio-server/PhysioBoo.Infrastructure.IntegrationTest/live-smoke`.
* **DB TEST** = `PhysioBoo.Infrastructure.IntegrationTest` (creates and drops its own database; skipped without `PHYSIOBOO_TEST_PG`).
* **UNIT** = `PhysioBoo.Application.Test`. **COMPILE** = tsc/ngc/dotnet build only.
* Not done: browser/UI runs (no automation was available), and anything depending on the real PostgreSQL functions below.
* LIVE runs used **test-only stand-ins** for `get_owner_permission_codes`, `get_permissionid_by_roleid` and
  `get_by_role_and_permission_id` (`live-smoke/testdb-standins.sql`), because the real definitions are not in the repository.
  Authorization and permission-loading results therefore prove the application logic, not the production functions.
* The long-running dev backend still has the old binaries; it must be restarted to pick up any of these fixes.

## Status legend

NOT STARTED · IN PROGRESS · FAILED · FIXED — VERIFIED · BLOCKED · NOT VERIFIED
(`FIXED — VERIFIED` is reserved for fixes proven by an executed test; source-only fixes are `FIXED — NOT VERIFIED (runtime)`.)

## Findings

| # | Sev | Module | Finding | Root cause | Status |
| --- | --- | --- | --- | --- | --- |
| F1 | High | System > User/Permission | Creating a permission always 404'd | `BASE_API.PERMISSION.CREATE` was `/api/permissions/create`; the route is `POST /api/permissions` | FIXED — NOT VERIFIED (runtime) |
| F2 | High | CMS > Doctor | Creating a doctor always failed (404/405) | The `POST /api/doctors` endpoint was dropped in refactor `b0eb198`; `CreateDoctorCommand` was left unmapped | FIXED — NOT VERIFIED (runtime): endpoint restored (`hr:doctor:register`), drawer now uses the id the server returns |
| F3 | High | System > User/Permission, Super Admin > Roles | Saving a role's permissions always failed; new roles got permissions assigned to a non-existent id | Frontend sent `{roleId, permissionId}`, backend expects `{roleId, permissions: {code: bool}}`; role id was client-generated but the server generates its own | FIXED — NOT VERIFIED (runtime) |
| F4 | Medium | System > User/Permission | Editing a role silently dropped colour and icon | `UpdateRoleCommandHandler` ignored `Color`/`Icon` | FIXED — VERIFIED (unit test `UpdateRoleCommandHandlerTest`) |
| F5 | Medium | All sortable lists (19 call sites) | Default sort (`createdAt:desc`) silently ignored, so unstable paging | Parser `SortQuery` did not implement the documented `field:asc/desc` format | FIXED — VERIFIED (unit test `SortQueryTest`, 9 cases) |
| F6 | Medium | Common category > Hospital group, Lab test category | Editing showed an error toast although the update was saved | Backend answers `204`; drawer read `res.success` on a `null` body | FIXED — NOT VERIFIED (runtime), type-checked (`update()` now `Observable<void>`) |
| F7 | Medium (security) | CMS > Article News | Anonymous callers could read Draft/Archived articles | Public `POST /api/articles/search` honoured an explicit `Status`; `GET /api/articles/{id}` had no status check | FIXED — NOT VERIFIED (runtime): non-staff are forced to `Published` |
| F8 | Medium | System > User/Permission | Permission search threw a TypeError; every permission fell into one group; the Category and Active inputs were discarded by the API | Backend `PermissionViewModel` has no `category`/`isActive` | FIXED — NOT VERIFIED (runtime): category derived from the code prefix, dead inputs removed |
| F9 | Low | System > Print templates | `getByCode` called a route that does not exist (`/by-code/{code}`) | Wrong path (method currently unused) | FIXED — NOT VERIFIED (runtime) |

### Round 2 fixes (same evidence level: compile + unit tests, no runtime)

| # | Sev | Module | Finding | Status |
| --- | --- | --- | --- | --- |
| F10 | High | CMS > Doctor | Rows had no `id` (server sends `userId`): table edit/delete, service doctor picker and admission doctor select used `undefined` | FIXED — VERIFIED (`DoctorViewModelTest`) |
| F11 | High | CMS > Doctor | Edit button created a duplicate; create payload also crashed (`archivements.join` on a string) and sent `languagesSpoken` as a string | FIXED — NOT VERIFIED (runtime): real edit flow (doctor step only; license/specialty read-only), payload fixed |
| F12 | High | System > Roles | `AssignPermissionToRoleCommand.RoleId` was never set, so the assign endpoint always failed validation; it also depended on an unversioned DB function | FIXED — VERIFIED (validation + handler tests); now EF-based in `RolePermissionRepository` (persistence itself not run) |
| F13 | High | All lookups | Server clamped `pageSize` to 100; 11 call sites ask for 200-500 (e.g. only 100 of 274 permissions could be granted) | FIXED — VERIFIED (`QueryParametersTest`), cap now 500 |
| F14 | High | System > Common category > Department | Create stored the department under `Guid.Empty` (form sends no id) so a second create would collide; Hospital was a free-text GUID box; Head of Department and Doctor Primary Specialty selects were permanently empty | FIXED — VERIFIED for the id (`CreateDepartmentCommandHandlerTest`); selects FIXED — NOT VERIFIED |
| F15 | Medium | System > Hospital | `hospitalGroupId`, `type`, `isActive`, `hasEmergencyServices` filters were ignored | FIXED — VERIFIED (`HospitalsSearchSpecTest`) |
| F16 | Medium | CMS > Article News | Admin list could never show Draft/Archived articles | FIXED — VERIFIED (`ArticlesSearchSpecTest`); staff-only `includeUnpublished` flag |
| F17 | Medium | Clinic > Medical record | Allergy names were blank (server sent `AllergyName`, UI reads `allergenName`; same for dates/notes) | FIXED — VERIFIED (`PatientAllergyViewModelTest`) |
| F18 | Low | Permissions, doctor awards/certifications | `CreatedAtRoute` pointed at route names that do not exist | FIXED — plain `Location` URLs |
| F19 | Low | Routing / dead code | Duplicate `crm/patient` route; unused `AuthService.loadPermissions`; unused `UserService.search_by_id` | REMOVED |

### Round 3 (found by running the system)

| # | Sev | Module | Finding | Status |
| --- | --- | --- | --- | --- |
| F20 | High | Registration, chat, dispensing, prescriptions, retail checkout, batch change | 7 handlers opened a user transaction while the DbContext retries on failure; EF rejects the first query inside it (tenant registration returned 500) | FIXED — LIVE + DB TEST (`IUnitOfWork.ExecuteInStrategyAsync`; tenant registration and chat verified live; the other 5 handlers share the wrapper but were not exercised) |
| F21 | High | Fresh databases | `--seed` migrated only the application context; `StoredDomainEvents` (event store) and the notification store were never created, so every event-raising command failed | FIXED — LIVE (`DatabaseSeeder` migrates all three contexts) |
| F22 | High | CMS > Article News | Creating an article failed (`Category` integer column bound as text); any entity with an int-mapped enum failed the same way | FIXED — DB TEST + LIVE (`BaseRepository` binds enums per the column mapping; string-mapped enums such as `HospitalType` still write names, DB TEST) |
| F23 | High | Reception > Patients | `POST /api/patients` returned 201 but wrote only the Profile; no Patient row | FIXED — DB TEST + LIVE |
| F24 | High | Every new account | Users created via tenant registration, create-user, invite registration and patient-portal invite had no role (the generic insert drops the `UserRole` link); a new tenant owner had zero permissions | FIXED — DB TEST + LIVE (`UserRepository.InsertWithRolesAsync`; tenant owner now gets ADMIN) |
| F25 | High | System > Department | Every department edit returned 404 (handler used the unsent body id) and the form dropped `isActive`, deactivating the department | FIXED — UNIT + LIVE; `isActive` kept by the form (COMPILE) |
| F26 | Medium | System > Roles | Assigning permissions to an unknown role returned 500 | FIXED — UNIT + LIVE (now 404) |
| F27 | Medium | Pharmacy > Inventory | Quick actions showed "... started" while doing nothing | FIXED — COMPILE: Stock Count / Audit deep-link to Stock Take; the other wizards say they are not available (wizards are deferred in `inventory-management-redesign.md` sections 15 and 18) |

### Database functions that are not in the repository (O2)

No migration, script, deployment file or Git commit (all branches, `git log -S`) defines any of these. They exist only in the
database used for development. They are called through `BaseRepository.ExecutePostgresFunctionAsync` as
`SELECT * FROM <name>(<param> => $1, ...)`:

| Function | Caller | Inputs | Expected result | Replaceable in application code? |
| --- | --- | --- | --- | --- |
| `get_user_for_login` | `UserRepository` | `p_email` | user columns + `Roles text[]`, `Permissions text[]` | Not safely (may hold lockout logic) |
| `get_identifier_for_login` | `UserRepository` | `p_identifier` | same as above | Not safely |
| `get_users_dynamic` | `GetUserByEmailQueryHandler` | `p_email` | `Users` columns | Yes (EF), unverified |
| `get_owner_permission_codes` | `PermissionRepository`, every permission check | `p_user_id` | `"Code"` per row | Probably (UserRoles > RolePermissions > Permissions); keep until compared with the original |
| `get_permissions_by_codes` | `PermissionRepository` | `p_codes text[]` | `"Id"`, `"Code"` | Yes |
| `get_permissionid_by_roleid` | `RoleRepository` | `p_role_id` | `"PermissionsId"` | Yes |
| `get_by_role_and_permission_id` | `RolePermissionRepository` | `p_role_id`, `p_permission_id` | `"Id"`, `"RoleId"`, `"PermissionId"` | Yes |
| `get_refresh_tokens_dynamic` | `RefreshTokenRepository`, `GetRefreshTokensByUserIdQueryHandler` | `p_token` / `p_user_id` | `RefreshTokens` columns | Yes, unverified |
| `get_tokens_dynamic` | `VerificationService`, `GetVerificationTokenByTokenQueryHandler` | `p_token` | `VerificationTokens` columns | Yes, unverified |
| `get_userid_by_token` | `VerificationTokenRepository` | `p_token` | user id | Yes |
| `get_by_provider_and_key` | `UserLoginRepository` | `p_provider`, `p_key` | `UserLogins` columns | Yes |
| `get_user_preferences_by_user_id` | `UserPreferenceRepository` | `p_user_id` | `UserPreferences` columns | Yes |
| `get_language_by_code` | `Sys_LanguageRepository` | `p_code` | `Sys_Languages` columns | Yes |
| `get_media_file_by_url` | `Sys_MediaFileRepository` | `p_url` | `Sys_MediaFiles` columns | Yes |
| `get_print_template_by_code` | `PrintTemplateRepository` | `p_code` | `PrintTemplates` columns | Yes |
| `get_print_template_version_by_template_id` | `PrintTemplateVersionRepository` | `p_template_id` | `PrintTemplateVersions` columns | Yes |
| `assign_permissions` | `RolePermissionRepository` | - | - | **Replaced** by EF code (F12) |

Recovery (read-only on the source database, run by the owner): connect to the development database with a read-only role and run

```sql
SELECT pg_get_functiondef(p.oid) || ';'
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.proname LIKE 'get\_%'
ORDER BY p.proname;
```

Save the output as `Database/Seeding/Sql/functions.sql` (idempotent `CREATE OR REPLACE`), run it after `--seed` and before `seed-data.sql`,
and add it to `docs/database-seeding.md`. Compare `get_owner_permission_codes` and `get_user_for_login` with the stand-ins before relying on them.
Until then a database built from this repository cannot log anyone in or evaluate a permission.

### Open

| # | Sev | Finding | Needs |
| --- | --- | --- | --- |
| O2 | Medium | The database functions above. | Owner: run the export above. |
| O3 | Low | System > File Manager is static demo data (`shared/data/dummy`) with no backend; it is a low-priority item in `superadmin-redesign.md` with no spec. | Product decision. |
| O4 | Low | About 19 legacy generic create endpoints (`patientAllergies/create`, `lab-orders`, ...) require the client to send the entity id in the body (an empty id is stored as `00000000-...`); no Admin screen calls them. | Decide: server-generated ids, or reject an empty id. |
| O5 | Low | Role/permission changes are cached for up to 5 minutes (`UserPermissions-{id}`). | Design choice. |
| O6 | Low | Browser/UI behaviour (doctor edit drawer, department selects, role matrix) has not been exercised. | A browser run. |

## Module inventory

Route → status of what has been checked. "Static" = URL/method/DTO/204/sort/permission checks above plus a compile; none of the rows is runtime-verified.

| Area | Page(s) | Services | Static result | Overall status |
| --- | --- | --- | --- | --- |
| Overview | dashboard | dashboard-overview | calls resolve | NOT VERIFIED |
| Reception | booking list, queue, registration | appointment, patient | calls resolve | NOT VERIFIED |
| Clinic | doctor-desk, prescription, medical-record | doctor-desk, prescription, medical-record | calls resolve; `/patients/{id}/prescriptions/recent` confirmed registered | NOT VERIFIED |
| Inpatient | bed-map, admission, nursing (dashboard, patient/:id, handover), treatment-sheet | bed-map, admission, nursing, treatment-sheet | calls resolve | NOT VERIFIED |
| Paraclinical | laboratory, radiology, surgery | laboratory, radiology, surgery | calls resolve | NOT VERIFIED |
| Pharmacy | retail, prescription-dispense, inventory-management, stock-take (+count) | retail-pos, dispensing, inventory-management, stock-take | calls resolve | NOT VERIFIED |
| Finance | cashier, insurance, reports | cashier, insurance-claims, revenue-report | calls resolve | NOT VERIFIED |
| CRM | patient, marketing-campaign, lead-management, support-complaint, member-point | patient, campaign, lead, complaint, member, reward | calls resolve | NOT VERIFIED |
| CMS | article-news, service, home-configuration, doctor | article, medical-service, home-*, doctor | F2, F7, O1 | PARTIAL — FIXED NOT VERIFIED |
| Academy | list, course/:id | academy | calls resolve | NOT VERIFIED |
| System | file-manager, note, scrumboard, user-permission, hospital, print-templates | resource, note, scrumboard, role, permission, user, hospital, print-template | F1, F3, F4, F8, F9 | PARTIAL — FIXED NOT VERIFIED |
| System | common-category (10 lists) | master-data services | F5, F6 | PARTIAL — FIXED NOT VERIFIED |
| System | settings (account, security, notification, team, theme, billing, sequence-tracker, admin-menu) | user, security, billing, sequence-tracker, menu | F5 | NOT VERIFIED |
| Profile | general | user | calls resolve | NOT VERIFIED |

## Files modified

Frontend: `shared/api/base.ts`, `shared/types/permission.types.ts`, `services/admin/{role,print-template,hospital-group,lab-test-category}.service.ts`,
`pages/admin/system/user-permission/user-permission.component.ts`, `pages/superadmin/roles/list.component.ts`,
`components/layout/admin/system/user-permission/permission-drawer.component.ts`,
`components/layout/admin/system/common-category/{hospital-group,lab-test-category}/*-drawer.component.ts`,
`components/layout/admin/cms/doctor/doctor-drawer.component.ts`.

Backend: `Presentation/Endpoints/{DoctorEndpoints,ArticleEndpoints}.cs`, `Application/Commands/Roles/UpdateRole/UpdateRoleCommandHandler.cs`,
`Application/ViewModels/Sorting/SortQuery.cs`, `Application/ViewModels/Permissions/PermissionViewModel.cs`.

Tests added: `Application.Test/Commands/Roles/UpdateRole/*`, `Application.Test/Sorting/SortQueryTest.cs`.
