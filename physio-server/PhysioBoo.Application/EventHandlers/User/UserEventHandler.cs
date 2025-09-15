using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKenel.Utils;
using PhysioBoo.SharedKernel.Utils;

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

    public sealed class UserEmailVerificationEventHandler : INotificationHandler<UsersCreatedEvent>
    {
        private readonly IMediatorHandler _bus;

        public UserEmailVerificationEventHandler(IMediatorHandler bus)
        {
            _bus = bus;
        }

        public async Task Handle(UsersCreatedEvent notification, CancellationToken cancellationToken)
        {
            foreach (var userId in notification.UserIds)
            {
                await _bus.RaiseEventAsync(new EmailVerificationRequiredEvent(
                    userId,
                    TokenHelper.GenerateTimestampedToken(24),
                    TimeZoneHelper.GetLocalTimeNow().AddHours(24)
                ));
            }
        }
    }
}
