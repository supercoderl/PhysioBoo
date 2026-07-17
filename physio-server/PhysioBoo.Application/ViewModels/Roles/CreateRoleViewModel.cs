namespace PhysioBoo.Application.ViewModels.Roles
{
    public sealed record CreateRoleViewModel
    (
        string Name,
        string Code,
        string? Description,
        string? Color,
        string? Icon
    );
}
