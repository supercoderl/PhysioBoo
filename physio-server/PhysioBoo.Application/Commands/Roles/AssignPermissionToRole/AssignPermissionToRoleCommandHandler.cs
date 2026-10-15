

using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;


namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandHandler : CommandHandlerBase, IRequestHandler<AssignPermissionToRoleCommand>
    {
        private readonly IRolePermissionRepository _rolePermissionRepository;
        private readonly IRoleRepository _roleRepository;

        public AssignPermissionToRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRolePermissionRepository rolePermissionRepository,
            IRoleRepository roleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _rolePermissionRepository = rolePermissionRepository;
            _roleRepository = roleRepository;
        }

        public async Task Handle(AssignPermissionToRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            if (await _roleRepository.GetByIdAsync(request.RoleId, ct: ct) is null)
            {
                await NotifyAsync(request.MessageType, $"Role with Id {request.RoleId} not found.", ErrorCodes.ObjectNotFound);
                return;
            }

            await _rolePermissionRepository.AssignPermissionsAsync(
                request.RoleId,
                request.PermissionForAssigning.Permissions,
                ct
            );
        }
    }
}
