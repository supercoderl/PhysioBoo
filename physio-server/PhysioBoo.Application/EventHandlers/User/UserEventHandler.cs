using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.EventHandlers.User
{
    public sealed class UserCacheEventHandler : INotificationHandler<UsersCreatedEvent>
    {
        private readonly IDistributedCache _distributedCache;

        public UserCacheEventHandler(IDistributedCache distributedCache)
        {
            _distributedCache = distributedCache;
        }

        public async Task Handle(UsersCreatedEvent notification, CancellationToken cancellationToken)
        {
            foreach (var userId in notification.UserIds)
            {
                await _distributedCache.RemoveAsync(
                    CacheKeyGenerator.GetEntityCacheKey<Domain.Entities.Core.User>(userId),
                    cancellationToken
                );
            }
        }
    }
}
