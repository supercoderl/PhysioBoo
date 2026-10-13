# Locations API — Backend Contract (Country → City → District → Ward)

**Status (2026-10-13):** the **read API is implemented** — entities, EF configuration, repositories, a SQL seed file (`seed-geography.sql`), and the four public `api/locations/*` endpoints (§5.1); the frontend calls them (no mock data left). **Still open:** the EF migration (must be generated, see §10), the management endpoints (§5.2), the `location:*` permissions, and storing the ids on `HospitalGroup` and the other entities (§6).
**Audience:** backend developer (`physio-server`). **Frontend:** `LocationService`, `boo-location-select`.
**Related:** `superadmin-platform-redesign.md` (Master Data is platform-owned data).

---

## 1. Why

Location is **platform-wide reference data**: every tenant picks from the same countries and cities, so it belongs to the platform owner (Master Data), not to a tenant.

Today there is no backend for it:

| Where | State |
|---|---|
| Server | No `Country` / `City` / `District` / `Ward` entities, no `api/locations`. `Address`, `Manufacturer`, `Supplier`, `HospitalGroup`… store `City` / `Country` as **free text**. (`Inpatient.Ward` is a *hospital ward*, unrelated.) |
| Frontend | `LocationService` calls the §5.1 endpoints (per-URL cache); the static JSON and the placeholder flag were removed. The hospital-group drawer already **sends** `countryId`, `cityId`, `districtId`, `wardId` in its create/update body, but the server ignores them (no such fields). |

## 2. Data model

Reference data, not tenant-scoped → derive from `AuditEntity`, **not** `TenantEntity` (same rule as the other shared catalogs).

```
Country  1 ─── * City  1 ─── * District  1 ─── * GeoWard
```

| Entity | Fields | Constraints |
|---|---|---|
| `Country` | `Id`, `Name` (≤150), `Code` (ISO 3166-1 alpha-2, 2 chars), `IsActive` | unique `Code` |
| `City` | `Id`, `CountryId`, `Name`, `Code` (≤10), `IsActive` | unique `(CountryId, Code)`; index `CountryId` |
| `District` | `Id`, `CityId`, `Name`, `Code`, `IsActive` | unique `(CityId, Code)`; index `CityId` |
| `GeoWard` | `Id`, `DistrictId`, `Name`, `Code`, `IsActive` | unique `(DistrictId, Code)`; index `DistrictId` |

Notes
- Name the last entity `GeoWard` (or put all four in a `Geography` namespace) to avoid clashing with `Inpatient.Ward`.
- **"City" is the first administrative level** (province / state), exactly as the UI labels it. The dataset's "cities" are provinces (e.g. *Tỉnh An Giang*, *Aichi*, *Johor*).
- District and ward levels exist only for Viet Nam in the current dataset; the picker already treats them as optional.
- Soft delete via the existing `Entity.DeletedAt`; prefer **deactivate** over delete.

### 2.1 Entity classes (implemented in `PhysioBoo.Domain/Entities/Geography/`)

Same conventions as `AdminMenu` / `Manufacturer`: private setters, one constructor, explicit `Set…` methods, a computed `SearchVector` for the search box. The code below is what was added to the Domain project (one file per class).

```csharp
using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Geography
{
    public class Country : AuditEntity
    {
        public string Name { get; private set; }
        public string Code { get; private set; }          // ISO 3166-1 alpha-2, upper case
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual ICollection<City> Cities { get; private set; } = new List<City>();

        public Country(Guid id, string name, string code) : base(id)
        {
            Name = name;
            Code = code;
            IsActive = true;
        }

        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }

    /// <summary>First administrative level (province / state); labelled "City" in the UI.</summary>
    public class City : AuditEntity
    {
        public Guid CountryId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual Country? Country { get; private set; }
        public virtual ICollection<District> Districts { get; private set; } = new List<District>();

        public City(Guid id, Guid countryId, string name, string code) : base(id)
        {
            CountryId = countryId;
            Name = name;
            Code = code;
            IsActive = true;
        }

        public void SetCountryId(Guid countryId) { CountryId = countryId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }

    public class District : AuditEntity
    {
        public Guid CityId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual City? City { get; private set; }
        public virtual ICollection<GeoWard> Wards { get; private set; } = new List<GeoWard>();

        public District(Guid id, Guid cityId, string name, string code) : base(id)
        {
            CityId = cityId;
            Name = name;
            Code = code;
            IsActive = true;
        }

        public void SetCityId(Guid cityId) { CityId = cityId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }

    /// <summary>Geographic ward / commune. Named GeoWard to avoid clashing with Inpatient.Ward (hospital ward).</summary>
    public class GeoWard : AuditEntity
    {
        public Guid DistrictId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual District? District { get; private set; }

        public GeoWard(Guid id, Guid districtId, string name, string code) : base(id)
        {
            DistrictId = districtId;
            Name = name;
            Code = code;
            IsActive = true;
        }

        public void SetDistrictId(Guid districtId) { DistrictId = districtId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
    }
}
```

EF configuration to add next to `AdminMenuConfiguration` (one `IEntityTypeConfiguration<T>` per entity):

| Entity | `ToTable` | Required | Indexes | Relationship |
|---|---|---|---|---|
| `Country` | `Countries` | `Name`, `Code` | unique `Code` | — |
| `City` | `Cities` | `Name`, `Code` | unique `(CountryId, Code)` | `HasOne(Country).WithMany(Cities)`, `OnDelete(Restrict)` |
| `District` | `Districts` | `Name`, `Code` | unique `(CityId, Code)` | `HasOne(City).WithMany(Districts)`, `OnDelete(Restrict)` |
| `GeoWard` | `GeoWards` | `Name`, `Code` | unique `(DistrictId, Code)` | `HasOne(District).WithMany(Wards)`, `OnDelete(Restrict)` |

Use `Restrict` (not `Cascade`): deleting a country must never silently wipe thousands of child rows. `SearchVector` uses the same `to_tsvector('english', unaccent(...))` computed column as `AdminMenu`, over `Name || ' ' || Code`. Remember to add the four `DbSet<>`s to `ApplicationDbContext` and a migration.

## 3. Seed data (no manual entry)

Seeded by `physio-server/PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-geography.sql` (generated from the original JSON files, which were then deleted):

| File | Shape | Rows |
|---|---|---|
| `countries.json` | `[{ id, name, code }]` | 249 |
| `cities.json` | `{ <countryId>: [{ id, name, code }] }` | 314 (9 countries: VN 63, TH 78, JP 47, ID 45, LA 18, KR 17, MY 16, KH 25, SG 5) |
| `districts.json` | `{ <cityId>: [...] }` | 4,509 |
| `wards.json` | `{ <districtId>: [...] }` | 10,051 |

Requirements
1. **Keep the ids from the files.** They are deterministic UUID v5 values, so selections already stored by the frontend stay valid.
2. Plain SQL, not C#: 500-row `INSERT … SELECT FROM (VALUES …) ON CONFLICT DO NOTHING` batches, parents first, one transaction.
3. Run it with `psql` after the migrations (see `database-seeding.md`).

## 4. Permissions

Add a `Location` group to `PhysioBoo.Domain/Constants/Permissions.cs` **and** add the new codes to the permissions section of `Seeding/Sql/seed-data.sql` (permissions are no longer created from the constants automatically; see `database-seeding.md`):

`location:country:{read,create,update,delete}`, `location:city:{…}`, `location:district:{…}`, `location:ward:{…}`
(frontend mirror in `permission.constant.ts` under `Location`).

## 5. Endpoints

All responses use the existing `ResponseMessage<T>` envelope and `NotificationResultFilter`.

### 5.1 Cascading read (used by the picker) — public reference data

Anonymous access is recommended (the tenant sign-up form is shown before login). Cache for 24 h (`Cache-Control: public, max-age=86400` + `ETag`); return **active** rows only, sorted by `Name`.

| # | Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|---|
| 1 | List countries | GET | `/api/locations/countries` | — | `ResponseMessage<LocationOption[]>` | `LocationService.getCountries()` |
| 2 | Cities of a country | GET | `/api/locations/countries/{countryId}/cities` | — | `LocationOption[]` | `getCities(countryId)` |
| 3 | Districts of a city | GET | `/api/locations/cities/{cityId}/districts` | — | `LocationOption[]` | `getDistricts(cityId)` |
| 4 | Wards of a district | GET | `/api/locations/districts/{districtId}/wards` | — | `LocationOption[]` | `getWards(districtId)` |

`LocationOption` = `{ "id": "guid", "name": "string", "code": "string | null" }` (matches `shared/types/location.types.ts`). Unknown or empty parent → `200` with `[]` (never `404`; the picker shows an empty list for countries without a lower level).

### 5.2 Management (Super Admin → Master Data → Locations)

One group per level, same shape as the existing catalogs (`search`, create, get by id, patch, delete). `RequireAuthorization` with the matching permission.

| # | Purpose | Method | URL | Request | Response | Frontend usage |
|---|---|---|---|---|---|---|
| 6 | Search countries | POST | `/api/countries/search` | `PagedRequest<{ isActive?: bool }>` (+ `search`, `sort`) | `PagedResult<CountryViewModel>` | Master Data list |
| 7 | Create / get / update / delete country | POST `/api/countries` · GET/PATCH/DELETE `/api/countries/{id}` | `{ name, code, isActive }` | `Guid` · `CountryViewModel` · `204` | drawer |
| 8 | Search cities | POST | `/api/cities/search` | `PagedRequest<{ countryId?: guid, isActive?: bool }>` | `PagedResult<CityViewModel>` | list |
| 9 | CRUD city | `/api/cities[/{id}]` | `{ countryId, name, code, isActive }` | as above | drawer |
| 10 | Search districts | POST | `/api/districts/search` | `PagedRequest<{ cityId?: guid, countryId?: guid, isActive?: bool }>` | `PagedResult<DistrictViewModel>` | list |
| 11 | CRUD district | `/api/districts[/{id}]` | `{ cityId, name, code, isActive }` | as above | drawer |
| 12 | Search wards | POST | `/api/geo-wards/search` | `PagedRequest<{ districtId?: guid, cityId?: guid, isActive?: bool }>` | `PagedResult<GeoWardViewModel>` | list |
| 13 | CRUD ward | `/api/geo-wards[/{id}]` | `{ districtId, name, code, isActive }` | as above | drawer |

View models

```
CountryViewModel   { id, name, code, isActive, cityCount, createdAt }
CityViewModel      { id, countryId, countryName, name, code, isActive, districtCount, createdAt }
DistrictViewModel  { id, cityId, cityName, countryName, name, code, isActive, wardCount, createdAt }
GeoWardViewModel   { id, districtId, districtName, cityName, name, code, isActive, createdAt }
```

Validation (FluentValidation, same style as other catalogs)
- `name` required, ≤ 150; `code` required, country exactly 2 letters (upper-cased), others ≤ 10; parent id must exist and be active.
- Duplicate `code` within its parent → `400` with the usual `DomainNotification`.
- **Delete** is rejected while the row has children, or (after §6) while records reference it → ask the user to deactivate instead.

## 6. Linking existing entities (second phase)

The frontend already submits `countryId / cityId / districtId / wardId` for hospital groups. Add the four nullable columns next to the existing text columns, keep the text as the display value:

| Entity | Add | Notes |
|---|---|---|
| `HospitalGroup` | `CountryId`, `CityId`, `DistrictId`, `WardId` | **Needed now**: the drawer already sends and reads them |
| `Hospital`, `Address`, `Manufacturer`, `Supplier`, `Profile` | same four ids | when their drawers adopt `boo-location-select` |

- On save, fill the legacy text (`Country`, `City`, …) from the selected rows so reports and search keep working.
- One-off migration: match existing free-text values to rows by name (case/diacritic-insensitive); leave the id null when nothing matches.
- Return the ids in the existing `*ViewModel`s (`HospitalGroupViewModel` currently has none, but the drawer reads `countryId` / `cityId`).

## 7. Performance & operations

- Wards are the large table (≈10k rows): always fetched by parent (`districtId`), never listed whole; index the parent column.
- Responses for §5.1 are small and cacheable; consider `IMemoryCache` per parent id, invalidated on any write in §5.2.
- Writes are rare and Super-Admin-only; audit them through the existing `Sys_AuditLog` interceptor.

## 8. Frontend switch (when the API is ready)

1. ~~Switch `LocationService` to the API; delete the JSON files and the placeholder flag~~ — done.
3. Add a **Locations** group to Super Admin → Master Data (four lists via `MasterDataRegistry`, one config entry per level) using §5.2.
4. Replace the free-text `country` / `city` inputs in the hospital, manufacturer, supplier and tenant-registration forms with `boo-location-select`.

## 9. Acceptance checklist

- [ ] Four tables created with the constraints in §2; migration applied.
- [ ] `seed-geography.sql` inserts 249 / 314 / 4,509 / 10,051 rows with the original ids; re-running inserts nothing.
- [ ] §5.1 returns the same lists the JSON files do (spot-check VN → *Tỉnh An Giang* → *Thành phố Long Xuyên* → *Phường Mỹ Bình*).
- [ ] `HospitalGroup` stores and returns the four ids.
- [ ] `location:*` permissions exist and are granted to `SUPER_ADMIN`.
- [ ] Management endpoints reject non-`SUPER_ADMIN` callers.

## 10. Implementation status & how to run it

**Added to `physio-server`** (read side only):

| Layer | Files |
|---|---|
| Domain | `Entities/Geography/{Country,City,District,GeoWard}.cs`, `Interfaces/Repositories/{ICountry,ICity,IDistrict,IGeoWard}Repository.cs` |
| Application | `ViewModels/Locations/LocationOptionViewModel.cs`, `Queries/Locations/GetOptions/GetLocationOptionsQuery.cs` + `…Handler.cs` (one query, a `LocationLevel` enum for the four levels) |
| Infrastructure | `Configuration/{Country,City,District,GeoWard}Configuration.cs`, `Repositories/{Country,City,District,GeoWard}Repository.cs`, `DbSet`s + `ApplyConfiguration` in `ApplicationDbContext`, DI lines in `ServiceCollectionExtensions`, `Database/Seeding/Sql/seed-geography.sql` |
| Presentation | `Endpoints/LocationEndpoints.cs` (4 anonymous GETs, `Cache-Control: public, max-age=86400`) + `app.MapLocationEndpoints()` in `Program.cs` |

**Run order** (migrations only run with `--seed`, normal startup does not; all reference data is SQL, see `database-seeding.md`):

```bash
# 1. generate the migration (needs a build, so it was not run for you)
dotnet ef migrations add AddGeography   --project PhysioBoo.Infrastructure --startup-project PhysioBoo.Presentation   --output-dir Migrations/ApplicationDb

# 2. apply migrations (exits when done)
dotnet run --project PhysioBoo.Presentation -- --seed

# 3. roles, admin, permissions, menus, plans (SQL)
psql -h <host> -U <user> -d <database> -v ON_ERROR_STOP=1 -f PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-data.sql

# 4. geography (SQL)
psql -h <host> -U <user> -d <database> -v ON_ERROR_STOP=1 -f PhysioBoo.Infrastructure/Database/Seeding/Sql/seed-geography.sql

# 5. start normally
dotnet run --project PhysioBoo.Presentation
```

Until step 1–2 are done the four endpoints fail with *relation "Countries" does not exist*, and the location pickers show no options. They also stay empty until `seed-geography.sql` has been run.

**Seeding** is idempotent (`ON CONFLICT DO NOTHING`), so re-running inserts nothing. Check with `SELECT count(*) FROM "GeoWards"` (10,051).

**Data verified before coding:** all 15,123 ids unique; no duplicate code inside a parent; longest name 58 chars, longest code 6, so the §2 length limits and unique indexes hold.

### Acceptance checklist (updated)

- [ ] Migration generated and applied; four tables with the unique indexes in §2.
- [ ] Row counts are 249 / 314 / 4,509 / 10,051; running the SQL again inserts nothing.
- [ ] `GET /api/locations/countries` returns 249 rows; VN → *Tỉnh An Giang* → *Thành phố Long Xuyên* → *Phường Mỹ Bình* resolves through the other three.
- [ ] Hospital-group drawer picker loads from the API (Network tab shows `api/locations/…`, no `assets/data/locations`).
- [ ] *(open)* `HospitalGroup` stores and returns the four ids (§6).
- [ ] *(open)* §5.2 management endpoints + `location:*` permissions + Super Admin Master Data pages.
