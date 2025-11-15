namespace PhysioBoo.Application.ViewModels.Permissions
{
    public sealed record CreatePermissionViewModel
    (
        Guid Id,
        string Name,
        string Code,
        string? Description
    );
}
