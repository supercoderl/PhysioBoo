using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Sessions.RevokeSession
{
    /// <summary>Signs a device out by expiring its refresh token. Its short-lived access token still runs out on its own.</summary>
    public sealed class RevokeSessionCommandHandler : CommandHandlerBase, IRequestHandler<RevokeSessionCommand>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUser _user;

        public RevokeSessionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRefreshTokenRepository refreshTokenRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _user = user;
        }

        public async Task Handle(RevokeSessionCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            // Scoped to the caller's own tokens, so one user can never sign another out.
            int updated = await _refreshTokenRepository.BatchUpdateMultipleAsync(
                predicate: t => t.Id == request.SessionId && t.UserId == userId && t.ExpiresAt > now,
                setterExpression: s => s.SetProperty(t => t.ExpiresAt, now),
                ct: ct
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Session not found or already signed out.",
                    ErrorCodes.ObjectNotFound
                ));
            }
        }
    }
}
