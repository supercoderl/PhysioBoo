using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Users.RemoveUserRole
{
    /// <summary>Revokes one role from a user of the caller's tenant.</summary>
    public sealed class RemoveUserRoleCommandHandler : CommandHandlerBase, IRequestHandler<RemoveUserRoleCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserRoleRepository _userRoleRepository;

        public RemoveUserRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IUserRoleRepository userRoleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
        }

        public async Task Handle(RemoveUserRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _userRepository.ExistsAsync(request.UserId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "User doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            // Hard delete: (UserId, RoleId) is unique, so a soft-deleted row would block re-granting.
            await _userRoleRepository.BatchDeleteAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId, ct);
        }
    }
}
