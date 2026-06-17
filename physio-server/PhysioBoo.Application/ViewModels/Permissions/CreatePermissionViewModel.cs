namespace PhysioBoo.Application.ViewModels.Permissions
{
    public sealed record CreatePermissionViewModel
    (
        string Name,
        string Code,
        string? Description
    );
}
