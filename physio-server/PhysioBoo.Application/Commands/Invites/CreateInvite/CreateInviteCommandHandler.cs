using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.Tenants;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Invites.CreateInvite
{
    public sealed class CreateInviteCommandHandler : CommandHandlerBase, IRequestHandler<CreateInviteCommand>
    {
        private readonly ITenantInviteRepository _tenantInviteRepository;
        private readonly IUser _user;

        public CreateInviteCommandHandler(
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

        public async Task Handle(CreateInviteCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newToken = TokenHelper.GenerateTimestampedToken(168);
            DateTime expiresAt = TimeZoneHelper.GetLocalTimeNow().AddDays(7);

            TenantInvite newTenantInvite = new TenantInvite(
                request.NewId,
                newToken,
                _user.GetTenantId(),
                request.NewInvitation.HospitalId,
                request.NewInvitation.IntendedRole,
                request.NewInvitation.Email,
                expiresAt
            );

            newTenantInvite.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _tenantInviteRepository.InsertAsync<TenantInvite, Guid>(newTenantInvite);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            await Bus.RaiseEventAsync(new TenantInviteCreatedEvent(
                result.Id,
                newTenantInvite.Email,
                newToken,
                expiresAt
            ));
        }
    }
}