using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed class UserMenuViewModel
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsActive { get; set; }
        public string PermissionCode { get; set; } = string.Empty;
        public IReadOnlyList<UserMenuViewModel>? Children { get; set; }

        public static UserMenuViewModel FromMenu(AdminMenu adminMenu)
        {
            return new UserMenuViewModel
            {
                Id = adminMenu.Id,
                Label = adminMenu.Label,
                Icon = adminMenu.Icon,
                Route = adminMenu.Route,
                Order = adminMenu.Order,
                IsActive = adminMenu.IsActive,
                PermissionCode = adminMenu.PermissionCode,
                Children = adminMenu.SubMenus.Any() ? adminMenu.SubMenus.Select(FromMenu).ToList() : null
            };
        }
    }
}
