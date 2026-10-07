using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Invites.RevokeInvite
{
    /// <summary>Revokes an unused invite by expiring it, so its sign-up link stops working.</summary>
    public sealed class RevokeInviteCommandHandler : CommandHandlerBase, IRequestHandler<RevokeInviteCommand>
    {
        private readonly ITenantInviteRepository _tenantInviteRepository;
        private readonly IUser _user;

        public RevokeInviteCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITenantInviteRepository tenantInviteRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _tenantInviteRepository = tenantInviteRepository;
            _user = user;
        }

        public async Task Handle(RevokeInviteCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid tenantId = _user.GetTenantId();
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            int updated = await _tenantInviteRepository.BatchUpdateMultipleAsync(
                predicate: i => i.Id == request.Id && i.TenantId == tenantId && !i.IsUsed && i.ExpiresAt > now,
                setterExpression: s => s.SetProperty(i => i.ExpiresAt, now),
                ct: ct
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Invite not found, already used or already expired.",
                    ErrorCodes.ObjectNotFound
                ));
            }
        }
    }
}
