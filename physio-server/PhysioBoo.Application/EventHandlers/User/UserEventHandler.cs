using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Domain;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.EventHandlers.User
{
    public sealed class UserCacheEventHandler :
        INotificationHandler<UsersCreatedEvent>,
        INotificationHandler<UserLoggedEvent>,
        INotificationHandler<UserLoggedOutEvent>,
        INotificationHandler<UserVerifiedEvent>
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUser _user;
        private readonly IMediatorHandler _bus;
        private readonly TokenSettings _token;

        public UserCacheEventHandler(
            IDistributedCache distributedCache,
            IHttpContextAccessor httpContextAccessor,
            IUser user,
            IMediatorHandler bus,
            IOptions<TokenSettings> options
        )
        {
            _distributedCache = distributedCache;
            _httpContextAccessor = httpContextAccessor;
            _user = user;
            _bus = bus;
            _token = options.Value;
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

        public async Task Handle(UserVerifiedEvent notification, CancellationToken cancellationToken)
        {
            var token = await _bus.QueryAsync(new GetVerificationTokenByTokenQuery(notification.Token));
            if (token == null) return;

            var type = Enum.Parse<VerificationType>(notification.Type);

            switch (type)
            {
                case VerificationType.Email:
                    await _bus.SendCommandAsync(new UpdateUserCommand(
                        token.UserId,
                        new
                        {
                            IsVerified = true,
                            EmailVerifiedAt = (DateTime?)TimeZoneHelper.GetLocalTimeNow()
                        })
                    );
                    break;
                case VerificationType.PasswordReset:
                    var (accessToken, refreshToken) = TokenHelper.BuildAuthToken(
                        new Dictionary<string, string>
                        {
                            ["Email"] = token.UserEmail,
                            ["Role"] = token.UserRole.ToString(),
                            ["Id"] = token.UserId.ToString(),
                            ["Name"] = token.UserEmail.Split("@")[0]
                        }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes
                    );

                    await _bus.RaiseEventAsync(new UserLoggedEvent(token.UserId, accessToken, refreshToken));
                    break;
            }
        }
    }
}
