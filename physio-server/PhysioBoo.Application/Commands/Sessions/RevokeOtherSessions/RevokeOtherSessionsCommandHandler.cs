using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Sessions.RevokeOtherSessions
{
    public sealed class RevokeOtherSessionsCommandHandler : CommandHandlerBase, IRequestHandler<RevokeOtherSessionsCommand>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUser _user;

        public RevokeOtherSessionsCommandHandler(
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

        public async Task Handle(RevokeOtherSessionsCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid userId = _user.GetUserId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            string current = request.CurrentRefreshToken ?? string.Empty;

            await _refreshTokenRepository.BatchUpdateMultipleAsync(
                predicate: t => t.UserId == userId && t.ExpiresAt > now && t.Token != current,
                setterExpression: s => s.SetProperty(t => t.ExpiresAt, now),
                ct: ct
            );
        }
    }
}
