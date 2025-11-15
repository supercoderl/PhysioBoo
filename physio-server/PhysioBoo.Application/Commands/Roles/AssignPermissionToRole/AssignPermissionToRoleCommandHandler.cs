using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Roles.AssignPermissionToRole
{
    public sealed class AssignPermissionToRoleCommandHandler : CommandHandlerBase, IRequestHandler<AssignPermissionToRoleCommand>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly IRolePermissionRepository _rolePermissionRepository;

        public AssignPermissionToRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPermissionRepository permissionRepository,
            IRolePermissionRepository rolePermissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _permissionRepository = permissionRepository;
            _rolePermissionRepository = rolePermissionRepository;
        }

        public async Task Handle(AssignPermissionToRoleCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            List<Permission> permissions = await _permissionRepository.GetByCodesAsync(request.PermissionForAssigning.Permissions.Keys.ToArray());
            Dictionary<string, Guid> permissionLookup = permissions.ToDictionary(p => p.Code, p => p.Id);

            List<RolePermission> existingPermissionIds = await _rolePermissionRepository
                .GetPermissionIdsByRoleIdAsync(request.PermissionForAssigning.RoleId);

            HashSet<Guid> existingSet = existingPermissionIds.Select(p => p.PermissionId).ToHashSet();

            foreach (KeyValuePair<string, bool> kv in request.PermissionForAssigning.Permissions)
            {
                string code = kv.Key;
                bool isChecked = kv.Value;

                if (!permissionLookup.TryGetValue(code, out Guid permissionId))
                    continue;

                bool exists = existingSet.Contains(permissionId);

                if (isChecked && !exists)
                {
                    await _rolePermissionRepository.InsertAsync<RolePermission, Guid>(new RolePermission(
                        Guid.NewGuid(),
                        request.PermissionForAssigning.RoleId,
                        permissionId
                    ));
                }
                else if (!isChecked && exists)
                {
                    await _rolePermissionRepository.BatchDeleteAsync(
                        x => x.RoleId == request.PermissionForAssigning.RoleId && x.PermissionId == permissionId
                    );
                }
            }
        }
    }
}
