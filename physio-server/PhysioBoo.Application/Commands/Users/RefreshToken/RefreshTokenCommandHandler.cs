using MediatR;
using Microsoft.Extensions.Options;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
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
        private readonly IUserRepository _userRepository;
        private readonly TokenSettings _token;

        public RefreshTokenCommandHandler(
           IMediatorHandler bus,
           IUnitOfWork unitOfWork,
           INotificationHandler<DomainNotification> notifications,
           IRefreshTokenRepository refreshTokenRepository,
           IUserRepository userRepository,
           IOptions<TokenSettings> options
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _userRepository = userRepository;
            _token = options.Value;
        }

        public async Task Handle(RefreshTokenCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.RefreshToken? token = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

            if (token == null || token.ExpiresAt < TimeZoneHelper.GetLocalTimeNow())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Token does not exists or has expired.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            User? user = await _userRepository.GetByIdentifierAsync(token.User?.Email ?? string.Empty);

            if (user == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"User does not exists.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            int result = await _refreshTokenRepository.BatchUpdateMultipleAsync(
                predicate: t => t.Id == token.Id,
                setterExpression: s => s
                    .SetProperty(p => p.ExpiresAt, TimeZoneHelper.GetLocalTimeNow())
            );

            if (result <= 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Cannot update refresh token",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            (string accessToken, string refreshToken) = TokenHelper.BuildAuthToken(
                new Dictionary<string, object>
                {
                    ["Email"] = user.Email,
                    ["Id"] = user.Id,
                    ["Name"] = user.Email.Split("@")[0],
                    ["TenantId"] = user.TenantId.ToString()
                }, _token.Secret, _token.Issuer, _token.Audience, _token.ExpiryDurationMinutes
            );

            request.Result = new AuthResult(accessToken, refreshToken);

            await Bus.RaiseEventAsync(new UserLoggedEvent(token.UserId, accessToken, refreshToken));
        }
    }
}
