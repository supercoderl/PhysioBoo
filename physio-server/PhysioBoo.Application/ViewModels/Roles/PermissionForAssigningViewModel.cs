namespace PhysioBoo.Application.ViewModels.Roles
{
    public sealed record PermissionForAssigningViewModel
    (
        Guid RoleId,
        Dictionary<string, bool> Permissions
    );
}
