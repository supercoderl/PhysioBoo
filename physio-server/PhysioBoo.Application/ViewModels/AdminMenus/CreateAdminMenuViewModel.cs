namespace PhysioBoo.Application.ViewModels.AdminMenus
{
    public sealed record CreateAdminMenuViewModel(
        string Label,
        string Icon,
        Guid? ParentId,
        string Route,
        int Order,
        string PermissionCode
    );
}
