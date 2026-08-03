using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Configurations.GetInitData
{
    public sealed class GetInitDataQueryHandler : IRequestHandler<GetInitDataQuery, InitDataViewModel>
    {
        private readonly ICacheService _cacheService;

        public GetInitDataQueryHandler(
            ICacheService cacheService
        )
        {
            _cacheService = cacheService;
        }

        public async Task<InitDataViewModel> Handle(GetInitDataQuery req, CancellationToken ct)
        {
            Task<List<RoleCacheViewModel>?> rolesTask = _cacheService.GetAsync<List<RoleCacheViewModel>>(CacheKeys.Roles, ct);
            Task<List<LanguageCacheViewModel>?> languagesTask = _cacheService.GetAsync<List<LanguageCacheViewModel>>(CacheKeys.Languages, ct);

            await Task.WhenAll(rolesTask, languagesTask);

            List<RoleCacheViewModel> roles = await rolesTask ?? throw new InvalidOperationException($"Cache key '{CacheKeys.Roles}' is empty.");
            List<LanguageCacheViewModel> languages = await languagesTask ?? throw new InvalidOperationException($"Cache key '{CacheKeys.Languages}' is empty.");

            return InitDataViewModel.FromConfig(roles, languages);
        }
    }
}
