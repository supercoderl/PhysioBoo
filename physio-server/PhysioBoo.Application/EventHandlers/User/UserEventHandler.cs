using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.EventHandlers.User
{
    public sealed class UserCacheEventHandler :
        INotificationHandler<UsersCreatedEvent>,
        INotificationHandler<UserLoggedEvent>,
        INotificationHandler<UserLoggedOutEvent>
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUser _user;

        public UserCacheEventHandler(
            IDistributedCache distributedCache,
            IHttpContextAccessor httpContextAccessor,
            IUser user
        )
        {
            _distributedCache = distributedCache;
            _httpContextAccessor = httpContextAccessor;
            _user = user;
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

        public async Task Handle(UserLoggedEvent notification, CancellationToken cancellationToken)
        {
            var response = _httpContextAccessor.HttpContext?.Response;
            AuthHelper.SetTokenCookie(response, "access_token", notification.AccessToken, _user.TimeZoneId);
            AuthHelper.SetTokenCookie(response, "refresh_token", notification.RefreshToken, _user.TimeZoneId);

            await Task.CompletedTask;
        }

        public async Task Handle(UserLoggedOutEvent notification, CancellationToken cancellationToken)
        {
            var response = _httpContextAccessor.HttpContext?.Response;
            AuthHelper.RemoveTokenCookie(response, "access_token");
            AuthHelper.RemoveTokenCookie(response, "refresh_token");

            await Task.CompletedTask;
        }
    }
}
