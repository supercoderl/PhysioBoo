# Database seeding

Reference data is plain SQL, run with `psql` after the migrations. C# seeds nothing; `--seed` only applies migrations (application, event-store and notification-store contexts).

| What | Where | How it runs |
|---|---|---|
| Roles, system admin, permissions, SUPER_ADMIN grants, admin menus, subscription plans, code-numbering rules | `physio-server/PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-data.sql` | `psql` (manual, idempotent) |
| Geography: countries, cities, districts, wards (15,123 rows) | `physio-server/PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-geography.sql` | `psql` (manual, idempotent) |

`DatabaseSeeder` only runs `MigrateAsync`. All seeding moved to SQL on 2026-10-13; the frontend has no mock data and always calls the API.

## Run order (new database or after a new migration)

```bash
# 1. add a migration if the model changed (needs a build)
dotnet ef migrations add <Name> --project PhysioBoo.Infrastructure --startup-project PhysioBoo.Presentation --output-dir Migrations/ApplicationDb

# 2. apply migrations (exits when done)
dotnet run --project PhysioBoo.Presentation -- --seed

# 3. seed roles, admin, permissions, menus, plans, sequence rules
psql -h <host> -U <user> -d <database> -v ON_ERROR_STOP=1 -f PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-data.sql

# 4. seed geography (about 1.7 MB, 15,123 rows)
psql -h <host> -U <user> -d <database> -v ON_ERROR_STOP=1 -f PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-geography.sql

# 5. start normally
dotnet run --project PhysioBoo.Presentation
```

Steps 2 to 4 can be repeated safely: each skips what already exists.

## What `seed-data.sql` contains

| # | Section | Rule when re-run |
|---|---|---|
| 1 | 13 roles (from the `Role` enum) | skipped if a role with the same **code or name** exists (`IX_Roles_Name` is unique) |
| 2 | "PhysioBoo Platform" tenant row (empty-guid `TenantId` the admin needs) | `ON CONFLICT DO NOTHING` |
| 3 | System admin user + `SUPER_ADMIN` link | only while no `SUPER_ADMIN` user exists |
| 4 | 274 permissions (from `Permissions.cs`) | skipped per code |
| 5 | `SUPER_ADMIN` gets every permission | adds only missing grants, so it also grants permissions added later |
| 6 | Admin menus (10 sections, 36 pages) | only while `AdminMenus` is empty, so menus edited in the UI are never overwritten |
| 7 | 3 subscription plans | only while `SubscriptionPlans` is empty |
| 8 | 22 code-numbering rules | skipped per entity type |

Ids are deterministic (`md5('<kind>:<key>')::uuid`), so the file is repeatable and references stay stable across environments. The whole file is one transaction.

## System admin login

`sysadmin@physioboo.com` / `Password123!`

The hash in the file is Argon2id (16-byte salt, 32-byte hash, 3 iterations, 64 MiB, 2 lanes, stored as `base64(salt ‖ hash)`), the same parameters as `AuthHelper`. It was computed outside .NET, so **confirm the login works once** after seeding. If it does not, the hash can be regenerated.
**Change the password after the first login**, or replace the hash before running the file on anything other than a developer machine. There is no longer a `Seeding:AdminPassword` setting; the C# seeder no longer creates users.

## ⚠ New permissions are no longer seeded automatically

Before, adding a constant to `Permissions.cs` created the permission row and granted it to `SUPER_ADMIN` on the next seed run. That is gone. When you add a permission constant, add it to section 4 of the SQL (and re-run it; section 5 grants it):

```sql
INSERT INTO "Permissions" ("Id", "Name", "Code")
SELECT md5('permission:' || 'system:audit-log:read')::uuid, 'System: AuditLogRead', 'system:audit-log:read'
WHERE NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Code" = 'system:audit-log:read');
-- then run section 5 of seed-data.sql to grant it to SUPER_ADMIN
```

Permissions that exist in `Permissions.cs` but are not in the SQL cannot be assigned to any role, so a page guarded by them returns 403 even for `SUPER_ADMIN`.

## `seed-geography.sql`

249 countries, 314 cities (first administrative level), 4,509 districts, 10,051 wards, inserted parents first in 500-row batches inside one transaction with `ON CONFLICT DO NOTHING`. The ids are the original UUID v5 values, so stored selections stay valid. `SearchVector` is generated and not inserted. It is a generated file; to change the data, edit the rows or regenerate it, do not reintroduce a C# seeder.

## Removed from C#

`SeedLocationsAsync` (and its embedded `Database/Seeding/Data/*.json`), `SeedAsync` / `IDatabaseSeeder.SeedAsync`, `SeedRoleAsync`, `SeedSystemAdminAsync`, `SeedPermissionsAsync`, `SeedSuperAdminPermissionsAsync`, `SeedAdminMenusAsync`, `SeedSubscriptionPlansAsync`, `SeedSequenceTrackersAsync`, and the development tenant seed (`SetDevelopmentDataAsync`, "PhysioBoo Rehabilitation Hospital" + `it@physioboo.com`). `DatabaseSeeder` no longer takes `IConfiguration` / `IHostEnvironment`.

The **dev-data generator** (Super Admin → Platform → Dev data, `api/dev-data/*`, `IDevDataService`) is a separate tool and was **not** removed; see `dev-data-generator-redesign.md`.
