using MediatR;
using Microsoft.Extensions.Options;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.RefreshToken
{
    public sealed class RefreshTokenCommandHandler : CommandHandlerBase, IRequestHandler<RefreshTokenCommand>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly TokenSettings _token;

        public RefreshTokenCommandHandler(
           IMediatorHandler bus,
           IUnitOfWork unitOfWork,
           INotificationHandler<DomainNotification> notifications,
           IRefreshTokenRepository refreshTokenRepository,
           IOptions<TokenSettings> options
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _token = options.Value;
        }

        public async Task Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var token = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

            if (token == null || token.ExpiresAt < TimeZoneHelper.GetLocalTimeNow())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Token does not exists or has expired.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            token.Revoke();

            var result = await _refreshTokenRepository.UpdateTrackedAsync(token);

            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Cannot update refresh token",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            var (accessToken, refreshToken) = TokenHelper.BuildAuthToken(
                new Dictionary<string, string>
                {
                    ["Email"] = token.User?.Email ?? string.Empty,
                    ["Role"] = token.User?.Role.ToString() ?? string.Empty,
                    ["Id"] = token.UserId.ToString(),
                    ["Name"] = (token.User?.Email ?? string.Empty).Split("@")[0]
                }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes
            );

            await Bus.RaiseEventAsync(new UserLoggedEvent(token.UserId, accessToken, refreshToken));
        }
    }
}
