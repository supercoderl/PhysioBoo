using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.AdminMenus
{
    public sealed class AdminMenuViewModel
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public int Order { get; set; }
        public string PermissionCode { get; set; } = string.Empty;
        public IReadOnlyList<AdminMenuViewModel>? Children { get; set; }

        public static AdminMenuViewModel FromAdminMenu(AdminMenu adminMenu)
        {
            return new AdminMenuViewModel
            {
                Id = adminMenu.Id,
                Label = adminMenu.Label,
                Icon = adminMenu.Icon,
                Route = adminMenu.Route,
                Order = adminMenu.Order,
                PermissionCode = adminMenu.PermissionCode,
                Children = adminMenu.SubMenus.Any() ? adminMenu.SubMenus.Select(sub => FromAdminMenu(sub)).ToList() : null
            };
        }
    }
}
