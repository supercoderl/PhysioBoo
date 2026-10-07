using Microsoft.EntityFrameworkCore;
using Npgsql;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Users.AddUserRole
{
    /// <summary>Grants one role to a user of the caller's tenant. Granting it twice is a no-op.</summary>
    public sealed class AddUserRoleCommandHandler : CommandHandlerBase, IRequestHandler<AddUserRoleCommand>
    {
        private const string SuperAdminCode = nameof(Domain.Enums.Role.SUPER_ADMIN);

        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IUser _user;

        public AddUserRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IUserRoleRepository userRoleRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _user = user;
        }

        public async Task Handle(AddUserRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            // Users are tenant-filtered, so this also stops cross-tenant grants.
            if (!await _userRepository.ExistsAsync(request.UserId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "User doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            string? roleCode = await _roleRepository.GetAllNoTracking(r => r.Id == request.RoleId).Select(r => r.Code).FirstOrDefaultAsync(ct);
            if (roleCode == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Role doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            // Only a super admin may create another super admin.
            if (roleCode == SuperAdminCode)
            {
                Guid callerId = _user.GetUserId();
                bool callerIsSuperAdmin = await _userRoleRepository.ExistsAsync(ur => ur.UserId == callerId && ur.Role!.Code == SuperAdminCode, ct);
                if (!callerIsSuperAdmin)
                {
                    await NotifyAsync(new DomainNotification(request.MessageType, "Only a super admin can grant the super admin role.", DomainErrorCodes.User.InvalidRole));
                    return;
                }
            }

            if (await _userRoleRepository.ExistsAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId, ct)) return;

            UserRole userRole = new UserRole(Guid.NewGuid(), request.UserId, request.RoleId, _user.GetUserId());
            SharedKernel.Results.DbResult<Guid> inserted = await _userRoleRepository.InsertAsync<UserRole, Guid>(userRole);
            if (inserted.Success) return;

            // (UserId, RoleId) is unique even for soft-deleted rows: revive the old grant instead.
            int revived = await _userRoleRepository.ExecuteNonQueryAsync(
                "UPDATE \"UserRoles\" SET \"DeletedAt\" = NULL WHERE \"UserId\" = @userId AND \"RoleId\" = @roleId",
                new[] { new NpgsqlParameter("userId", request.UserId), new NpgsqlParameter("roleId", request.RoleId) });

            if (revived == 0)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Failed to assign the role: {inserted.Error}", ErrorCodes.CommitFailed));
            }
        }
    }
}
