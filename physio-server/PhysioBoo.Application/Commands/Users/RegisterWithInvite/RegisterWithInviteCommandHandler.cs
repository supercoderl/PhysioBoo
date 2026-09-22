using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Users.RegisterWithInvite
{
    public sealed class RegisterWithInviteCommandHandler : CommandHandlerBase, IRequestHandler<RegisterWithInviteCommand>
    {
        private readonly ITenantInviteRepository _tenantInviteRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUserProvisioningService _userProvisioningService;

        public RegisterWithInviteCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITenantInviteRepository tenantInviteRepository,
            IUserRepository userRepository,
            IUserProvisioningService userProvisioningService
        ) : base(bus, unitOfWork, notifications)
        {
            _tenantInviteRepository = tenantInviteRepository;
            _userRepository = userRepository;
            _userProvisioningService = userProvisioningService;
        }

        public async Task Handle(RegisterWithInviteCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.TenantInvite? invite = await _tenantInviteRepository.GetByTokenAsync(request.NewRegistration.Token, cancellationToken);

            if (invite == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Invalid or expired invite token.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (invite.IsUsed)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This invite has already been used.",
                    DomainErrorCodes.TenantInvite.AlreadyUsed
                ));
                return;
            }

            if (invite.ExpiresAt < TimeZoneHelper.GetLocalTimeNow())
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This invite has expired.",
                    DomainErrorCodes.TenantInvite.Expired
                ));
                return;
            }

            if (invite.Email != null && invite.Email != request.NewRegistration.Email)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "The email address does not match the invite.",
                    DomainErrorCodes.TenantInvite.EmailMismatch
                ));
                return;
            }

            Domain.Entities.Core.User newUser = await _userProvisioningService.BuildAsync(
                Guid.NewGuid(),
                new CreateUserViewModel(
                    request.NewRegistration.Email,
                    request.NewRegistration.Phone,
                    request.NewRegistration.Password,
                    invite.IntendedRole
                ),
                null,
                invite.CreatedBy
            );

            newUser.SetTenantId(invite.TenantId);

            SharedKernel.Results.DbResult<Guid> result = await _userRepository.InsertAsync<User, Guid>(newUser);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            invite.SetIsUsed(true);
            invite.SetUsedByUserId(result.Id);
            await _tenantInviteRepository.UpdateTrackedAsync(invite, cancellationToken);
        }
    }
}