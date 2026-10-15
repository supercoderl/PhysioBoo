# Live smoke checks (disposable database only)

Drives a running API with real HTTP calls and checks what was actually persisted with SQL.
**Never point this at the development database**: it creates tenants/users and writes rows.

1. Start a throw-away PostgreSQL (own data directory, own port), e.g. `initdb -D <dir> -U postgres -A trust`,
   `pg_ctl -D <dir> -o "-p 55432 -c listen_addresses=127.0.0.1" start`, then `createdb -p 55432 -U postgres physio_it`.
2. Migrate it: `ConnectionStrings__DefaultConnection="Host=127.0.0.1;Port=55432;Database=physio_it;Username=postgres" dotnet run --project PhysioBoo.Presentation -- --seed`
   (applies the application, event-store and notification-store migrations), then run `seed-data.sql` with `psql`.
3. `psql -p 55432 -U postgres -d physio_it -f testdb-standins.sql`. **TEST-ONLY stand-ins** for database functions
   whose real definitions are not in the repository (see docs/admin-audit-checklist.md, O2). They are not production code.
4. Start the API against that database, e.g. `ASPNETCORE_URLS=http://127.0.0.1:5199`, with `Auth__Issuer=it-issuer`,
   `Auth__Audience=it-audience`, `Auth__Secret=<same as IT_JWT_SECRET>`, `RabbitMQ__Enabled=false`.
5. `set PSQL=<path to psql>`, then run once each on a fresh database (the scripts are not idempotent):
   `python it_setup.py` (registers a tenant), `python it_roles.py`, `python it_clinic.py`, `python it_chat.py`.

The repository-level integration tests (`dotnet test PhysioBoo.Infrastructure.IntegrationTest`) are separate: set
`PHYSIOBOO_TEST_PG="Host=127.0.0.1;Port=55432;Username=postgres"`; each test class creates and drops its own database.
