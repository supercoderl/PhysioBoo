using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.AdminMenus.GetMine
{
    public sealed class GetMyMenusQueryHandler : IRequestHandler<GetMyMenusQuery, List<UserMenuViewModel>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAdminMenuRepository _adminMenuRepository;
        private readonly IUser _user;

        public GetMyMenusQueryHandler(
            IUserRepository userRepository,
            IAdminMenuRepository adminMenuRepository,
            IUser user
        )
        {
            _userRepository = userRepository;
            _adminMenuRepository = adminMenuRepository;
            _user = user;
        }

        public async Task<List<UserMenuViewModel>> Handle(GetMyMenusQuery request, CancellationToken ct)
        {
            User? user = await _userRepository.GetByIdAsync(
                _user.GetUserId(),
                includeProperties: "UserRoles,UserRoles.Role,UserRoles.Role.RolePermissions.Permission"
            );

            if (user is null) return new List<UserMenuViewModel>();

            HashSet<string> permissions = user.UserRoles
                .Where(ur => ur.Role != null)
                .SelectMany(ur => ur.Role!.RolePermissions)
                .Where(rp => rp.Permission != null)
                .Select(rp => rp.Permission!.Code)
                .ToHashSet();

            List<AdminMenu> allMenus = await _adminMenuRepository
                .GetAllNoTracking(filter: m => m.IsActive, orderBy: q => q.OrderBy(m => m.Order))
                .ToListAsync(ct);

            ILookup<Guid?, AdminMenu> byParent = allMenus.ToLookup(m => m.ParentId);

            bool HasAccess(AdminMenu menu) =>
                string.IsNullOrEmpty(menu.PermissionCode) || permissions.Contains(menu.PermissionCode);

            List<AdminMenu> BuildAllowed(Guid? parentId) =>
                byParent[parentId]
                    .Where(HasAccess)
                    .Select(m =>
                    {
                        m.SubMenus.Clear();
                        foreach (AdminMenu child in BuildAllowed(m.Id))
                        {
                            m.SubMenus.Add(child);
                        }
                        return m;
                    })
                    .ToList();

            return BuildAllowed(null).Select(UserMenuViewModel.FromMenu).ToList();
        }
    }
}
