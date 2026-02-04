using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Text.Json;

namespace PhysioBoo.Application.Queries.Sys_Languages.GetAllLanguages
{
    public sealed class GetAllLanguagesQueryHandler : IRequestHandler<GetAllLanguagesQuery, List<LanguageViewModel>>
    {
        private readonly ISys_LanguageRepository _sys_LanguageRepository;
        private readonly IDistributedCache _cache;

        public GetAllLanguagesQueryHandler(
            ISys_LanguageRepository sys_LanguageRepository,
            IDistributedCache cache
        )
        {
            _sys_LanguageRepository = sys_LanguageRepository;
            _cache = cache;
        }

        public async Task<List<LanguageViewModel>> Handle(GetAllLanguagesQuery q, CancellationToken cancellationToken)
        {
            string cacheKey = $"config_languages";
            string? cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
            List<LanguageViewModel> languages = new List<LanguageViewModel>();

            if (string.IsNullOrEmpty(cachedData))
            {
                List<Sys_Language> eLanguages = await _sys_LanguageRepository.GetAllNoTracking().ToListAsync(cancellationToken);

                // Map to view model
                languages = eLanguages.Select(l => LanguageViewModel.FromLanguage(l)).ToList();

                DistributedCacheEntryOptions cacheOptions = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
                };
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(languages), cacheOptions, cancellationToken);
            }
            else
            {
                languages = JsonSerializer.Deserialize<List<LanguageViewModel>>(cachedData) ?? new List<LanguageViewModel>();
            }

            return languages;
        }
    }
}
