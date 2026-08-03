using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Roles.DeletePermissionFromRole
{
    public sealed class DeletePermissionFromRoleCommandHandler : CommandHandlerBase, IRequestHandler<DeletePermissionFromRoleCommand>
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public DeletePermissionFromRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRoleRepository roleRepository,
            IRolePermissionRepository rolePermissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _roleRepository = roleRepository;
            _rolePermissionRepository = rolePermissionRepository;
        }

        public async Task Handle(DeletePermissionFromRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.RolePermission? rolePermission = await _rolePermissionRepository.GetByBothIdAsync(request.RoleId, request.PermissionId);

            if (rolePermission == null)
            {
                await NotifyAsync(request.MessageType, "Permission not found for the specified role.", ErrorCodes.ObjectNotFound);
                return;
            }

            _rolePermissionRepository.SoftDeleteSingle(rolePermission, true, ct);
            await CommitAsync();
        }
    }
}