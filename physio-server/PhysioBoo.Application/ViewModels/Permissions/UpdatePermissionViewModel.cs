namespace PhysioBoo.Application.ViewModels.Permissions
{
    public sealed record UpdatePermissionViewModel(
        string Name,
        string Code,
        string? Description
    );
}
