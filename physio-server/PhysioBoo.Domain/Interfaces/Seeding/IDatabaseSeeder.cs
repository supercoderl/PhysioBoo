namespace PhysioBoo.Domain.Interfaces.Seeding
{
    public interface IDatabaseSeeder
    {
        Task MigrateAsync(CancellationToken cancellationToken = default);
        Task SeedAsync(CancellationToken cancellationToken = default);
    }
}
