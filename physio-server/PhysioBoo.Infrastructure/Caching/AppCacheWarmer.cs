using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Infrastructure.Caching
{
    public sealed class AppCacheWarmer : ICacheWarmer
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ICacheService _cache;
        private readonly ILogger<AppCacheWarmer> _logger;

        public AppCacheWarmer(
            IServiceScopeFactory scopeFactory,
            ICacheService cache,
            ILogger<AppCacheWarmer> logger)
        {
            _scopeFactory = scopeFactory;
            _cache = cache;
            _logger = logger;
        }

        public async Task WarmAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("Warming application cache...");

            try
            {
                await Task.WhenAll(
                    WarmRolesAsync(ct),
                    WarmLanguagesAsync(ct)
                );

                _logger.LogInformation("Cache warming complete.");
            }
            catch (Exception)
            {

                throw;
            }
        }

        private async Task WarmRolesAsync(CancellationToken ct)
        {
            await using AsyncServiceScope scope = _scopeFactory.CreateAsyncScope();
            IRoleRepository repository = scope.ServiceProvider.GetRequiredService<IRoleRepository>();

            List<RoleCacheViewModel> roles = await repository.GetAllNoTracking(filter: x => x.IsActive && x.IsPublicForRegistration)
                .Select(x => new RoleCacheViewModel(x.Id, x.Name)).ToListAsync(ct);

            await _cache.SetAsync(CacheKeys.Roles, roles, CacheKeys.NoExpiry, ct);
            _logger.LogInformation("Cached {Count} roles", roles.Count);
        }

        private async Task WarmLanguagesAsync(CancellationToken ct)
        {
            await using AsyncServiceScope scope = _scopeFactory.CreateAsyncScope();
            ISys_LanguageRepository repository = scope.ServiceProvider.GetRequiredService<ISys_LanguageRepository>();

            List<LanguageCacheViewModel> languages = await repository.GetAllNoTracking(filter: x => x.IsActive)
                .Select(x => new LanguageCacheViewModel(x.Id, x.Name)).ToListAsync(ct);

            await _cache.SetAsync(CacheKeys.Languages, languages, CacheKeys.NoExpiry, ct);
            _logger.LogInformation("Cached {Count} languages", languages.Count);
        }
    }
}
