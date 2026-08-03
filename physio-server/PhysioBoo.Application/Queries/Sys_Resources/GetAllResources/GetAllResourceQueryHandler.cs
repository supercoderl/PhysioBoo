using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace PhysioBoo.Application.Queries.Sys_Resources.GetAllResources
{
    public sealed class GetAllResourceQueryHandler : IRequestHandler<GetAllResourceQuery, string>
    {
        private readonly ISys_ResourceRepository _sys_ResourceRepository;
        private readonly ISys_LanguageRepository _sys_LanguageRepository;
        private readonly IDistributedCache _cache;
        private readonly IMediatorHandler _bus;

        public GetAllResourceQueryHandler(
            ISys_ResourceRepository sys_ResourceRepository,
            ISys_LanguageRepository sys_LanguageRepository,
            IDistributedCache cache,
            IMediatorHandler bus
        )
        {
            _sys_ResourceRepository = sys_ResourceRepository;
            _sys_LanguageRepository = sys_LanguageRepository;
            _cache = cache;
            _bus = bus;
        }

        public async Task<string> Handle(GetAllResourceQuery request, CancellationToken ct)
        {
            string cacheKey = $"i18n_{request.LangCode}";

            string? cachedJson = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedJson))
            {
                return cachedJson;
            }

            Domain.Entities.System.Sys_Language? langId = await _sys_LanguageRepository.GetByCodeAsync(request.LangCode);

            if (langId == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAllResourceQuery),
                    $"Language {request.LangCode} does not exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return string.Empty;
            }

            Dictionary<string, string> resources = await _sys_ResourceRepository.GetAllNoTracking()
                .Where(r => r.LanguageId == langId.Id)
                .Select(r => new { r.Key, r.Value })
                .ToDictionaryAsync(r => r.Key, r => r.Value);

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            string json = JsonSerializer.Serialize(resources, options);

            await _cache.SetStringAsync(cacheKey, json, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
            });

            return json;
        }
    }
}
