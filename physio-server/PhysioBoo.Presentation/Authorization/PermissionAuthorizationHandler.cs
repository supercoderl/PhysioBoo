using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain.Interfaces.Repositories;
using System.Security.Claims;
using System.Text.Json;

namespace PhysioBoo.Presentation.Authorization
{
    public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        private readonly IPermissionRepository _permissionRepository;
        private readonly IDistributedCache _cache;

        public PermissionAuthorizationHandler(IPermissionRepository permissionRepository, IDistributedCache cache)
        {
            _permissionRepository = permissionRepository;
            _cache = cache;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            Claim? userIdClaim = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim?.Value, out Guid userId))
            {
                return;
            }

            IReadOnlyCollection<string> permissions = await GetPermissionsAsync(userId);

            if (permissions.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
            }
        }

        private async Task<IReadOnlyCollection<string>> GetPermissionsAsync(Guid userId)
        {
            string cacheKey = $"UserPermissions-{userId}";

            string? cachedJson = await _cache.GetStringAsync(cacheKey);
            if (cachedJson is not null)
            {
                return JsonSerializer.Deserialize<string[]>(cachedJson) ?? [];
            }

            List<string> codes = await _permissionRepository.GetOwnerPermissionCodes(userId);

            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(codes), new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheDuration
            });

            return codes;
        }
    }
}
