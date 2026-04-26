namespace PhysioBoo.Application.ViewModels.AdminMenus
{
    public sealed record UpdateAdminMenuViewModel(
        string Label,
        string Icon,
        Guid? ParentId,
        string Route,
        int Order,
        string PermissionCode,
        bool IsActive
    );
}
