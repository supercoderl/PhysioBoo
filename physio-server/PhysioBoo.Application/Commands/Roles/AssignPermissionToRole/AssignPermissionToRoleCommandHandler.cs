using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using System.Text.Json;

namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandHandler : CommandHandlerBase, IRequestHandler<AssignPermissionToRoleCommand>
    {
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public AssignPermissionToRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRolePermissionRepository rolePermissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _rolePermissionRepository = rolePermissionRepository;
        }

        public async Task Handle(AssignPermissionToRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string perJson = JsonSerializer.Serialize(request.PermissionForAssigning.Permissions.Select(x => new
            {
                code = x.Key,
                isChecked = x.Value
            }));

            await _rolePermissionRepository.AssignPermissionsAsync(request.PermissionForAssigning.RoleId, perJson);
        }
    }
}
