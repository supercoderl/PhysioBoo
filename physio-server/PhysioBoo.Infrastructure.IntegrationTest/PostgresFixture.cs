using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using NSubstitute;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Infrastructure.Database;
using Xunit;

namespace PhysioBoo.Infrastructure.IntegrationTest
{
    /// <summary>
    /// These tests need a PostgreSQL server. Set PHYSIOBOO_TEST_PG to a connection string WITHOUT a database,
    /// for example "Host=127.0.0.1;Port=55432;Username=postgres". Each test class creates its own uniquely named
    /// database on that server, migrates it and drops it afterwards, so existing databases are never touched.
    /// Without the variable the tests are skipped.
    /// </summary>
    public sealed class PgFactAttribute : FactAttribute
    {
        public PgFactAttribute()
        {
            if (string.IsNullOrWhiteSpace(PostgresFixture.ServerConnectionString))
            {
                Skip = "PHYSIOBOO_TEST_PG is not set (needs a disposable PostgreSQL server).";
            }
        }
    }

    public sealed class PostgresFixture : IAsyncLifetime
    {
        public static string? ServerConnectionString => Environment.GetEnvironmentVariable("PHYSIOBOO_TEST_PG");

        public static readonly Guid TenantId = Guid.NewGuid();

        private string _database = string.Empty;
        private string _connectionString = string.Empty;

        public IUser User { get; } = Substitute.For<IUser>();

        public async Task InitializeAsync()
        {
            if (string.IsNullOrWhiteSpace(ServerConnectionString)) return;

            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            _database = "physio_it_" + Guid.NewGuid().ToString("N")[..12];
            await AdminAsync($"CREATE DATABASE \"{_database}\"");

            NpgsqlConnectionStringBuilder builder = new(ServerConnectionString) { Database = _database };
            _connectionString = builder.ConnectionString;

            User.IsAuthenticated.Returns(true);
            User.GetUserId().Returns(Guid.NewGuid());
            User.GetTenantId().Returns(TenantId);

            await using ApplicationDbContext app = CreateContext();
            await app.Database.MigrateAsync();

            // The tenant row every tenant-owned row points at.
            await app.Database.ExecuteSqlRawAsync(
                "INSERT INTO \"HospitalGroups\" (\"Id\", \"Name\", \"IsActive\", \"CreatedAt\") VALUES ({0}, 'IT tenant', TRUE, LOCALTIMESTAMP)", TenantId);
        }

        public async Task DisposeAsync()
        {
            if (string.IsNullOrEmpty(_database)) return;
            NpgsqlConnection.ClearAllPools();
            await AdminAsync($"DROP DATABASE IF EXISTS \"{_database}\" WITH (FORCE)");
        }

        /// <summary>Same options as the API: Npgsql with retry-on-failure, which is what makes user transactions need the strategy.</summary>
        public ApplicationDbContext CreateContext()
        {
            DbContextOptionsBuilder<ApplicationDbContext> options = new();
            options.UseNpgsql(_connectionString, npgsql => npgsql
                .MigrationsAssembly("PhysioBoo.Infrastructure")
                .EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null));
            options.ReplaceService<IModelCacheKeyFactory, TenantModelCacheKeyFactory>();

            return new ApplicationDbContext(options.Options, User, Substitute.For<IHttpContextAccessor>());
        }

        public UnitOfWork<ApplicationDbContext> CreateUnitOfWork(ApplicationDbContext context)
            => new(context, NullLogger<UnitOfWork<ApplicationDbContext>>.Instance);

        private static async Task AdminAsync(string sql)
        {
            await using NpgsqlConnection connection = new(ServerConnectionString);
            await connection.OpenAsync();
            await using NpgsqlCommand command = new(sql, connection);
            await command.ExecuteNonQueryAsync();
        }
    }
}
