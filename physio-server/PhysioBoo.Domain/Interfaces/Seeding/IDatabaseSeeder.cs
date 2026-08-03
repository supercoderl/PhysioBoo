namespace PhysioBoo.Domain.Interfaces.Seeding
{
    public interface IDatabaseSeeder
    {
        Task MigrateAsync(CancellationToken ct = default);
        Task SeedAsync(CancellationToken ct = default);
    }
}
