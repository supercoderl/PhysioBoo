using Microsoft.Extensions.Hosting;
using PhysioBoo.Domain.Interfaces.Seeding;

namespace PhysioBoo.Infrastructure.Database.DevData
{
    internal sealed class DevDataService : IDevDataService
    {
        private const int MaxRows = 1000;

        private readonly ApplicationDbContext _db;
        private readonly IHostEnvironment _environment;
        private readonly IReadOnlyDictionary<string, IDevDataModule> _modules;

        public DevDataService(ApplicationDbContext db, IHostEnvironment environment, IEnumerable<IDevDataModule> modules)
        {
            _db = db;
            _environment = environment;
            _modules = modules.ToDictionary(m => m.Key);
        }

        public DevDataModuleList GetModules()
        {
            if (!_environment.IsDevelopment())
            {
                return new DevDataModuleList(false, MaxRows, Array.Empty<DevDataModuleInfo>());
            }

            // Composite modules (the one-click demo facility) come first: they are the entry point.
            List<DevDataModuleInfo> modules = _modules.Values
                .OrderByDescending(m => m is IDevDataCompositeModule)
                .Select(m => new DevDataModuleInfo(m.Key, m.Label, m.Description, m.DependsOn))
                .ToList();

            return new DevDataModuleList(true, MaxRows, modules);
        }

        public async Task<DevDataResult> GenerateAsync(string moduleKey, Guid tenantId, int count, CancellationToken ct = default)
        {
            if (!_environment.IsDevelopment())
                throw new DevDataException("The generator is switched off on this server.");

            if (!_modules.TryGetValue(moduleKey, out IDevDataModule? module))
                throw new DevDataException($"Unknown module '{moduleKey}'.");

            if (count < 1 || count > MaxRows)
                throw new DevDataException($"Rows must be a whole number from 1 to {MaxRows}.");

            bool tenantExists = await _db.HospitalGroups.IgnoreQueryFilters()
                .AnyAsync(g => g.Id == tenantId && g.DeletedAt == null, ct);
            if (!tenantExists)
                throw new DevDataException("The selected tenant does not exist.");

            DevDataResult? result = null;

            // The context retries on transient failures, which rejects user-started transactions unless the whole unit
            // runs inside the strategy; a retry then rebuilds the request state from scratch.
            Microsoft.EntityFrameworkCore.Storage.IExecutionStrategy strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                _db.ChangeTracker.Clear();
                await using Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction = await _db.Database.BeginTransactionAsync(ct);

                try
                {
                    DevDataContext context = new DevDataContext(_db, tenantId, Random.Shared);
                    if (module is IDevDataCompositeModule composite)
                        await RunCompositeAsync(composite, count, context, ct);
                    else
                        await GenerateWithDependenciesAsync(module, count, context, new HashSet<string>(), ct);

                    await transaction.CommitAsync(ct);

                    result = new DevDataResult(Guid.NewGuid(), context.Created, context.Warnings, context.Reused);
                }
                catch
                {
                    await transaction.RollbackAsync(ct);
                    throw;
                }
            });

            return result!;
        }

        /// <summary>Runs the steps of a composite module in order; a step whose data already exists is reused, not repeated.</summary>
        private async Task RunCompositeAsync(IDevDataCompositeModule composite, int count, DevDataContext context, CancellationToken ct)
        {
            foreach (DevDataStep step in composite.Plan(count))
            {
                if (!_modules.TryGetValue(step.ModuleKey, out IDevDataModule? stepModule))
                    throw new InvalidOperationException($"Composite module '{composite.Key}' lists unknown step '{step.ModuleKey}'.");

                if (await stepModule.HasDataAsync(context, ct))
                {
                    context.Reuse(step.ModuleKey);
                    continue;
                }

                await GenerateWithDependenciesAsync(stepModule, step.Rows, context, new HashSet<string>(), ct);
            }
        }

        /// <summary>Creates a module's missing parents first (a tenth of the requested rows, at least one), then the module itself.</summary>
        private async Task GenerateWithDependenciesAsync(IDevDataModule module, int count, DevDataContext context, HashSet<string> path, CancellationToken ct)
        {
            if (!path.Add(module.Key))
                throw new InvalidOperationException($"Dev data modules depend on each other in a loop at '{module.Key}'.");

            foreach (string dependencyKey in module.DependsOn)
            {
                if (!_modules.TryGetValue(dependencyKey, out IDevDataModule? dependency))
                {
                    context.Warn($"Module '{module.Key}' needs '{dependencyKey}', which is not available yet.");
                    continue;
                }

                if (!await dependency.HasDataAsync(context, ct))
                {
                    await GenerateWithDependenciesAsync(dependency, Math.Max(1, (int)Math.Ceiling(count / 10.0)), context, path, ct);
                }
            }

            await module.GenerateAsync(context, count, ct);
            path.Remove(module.Key);
        }
    }
}
