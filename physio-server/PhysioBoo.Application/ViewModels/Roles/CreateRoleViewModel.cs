namespace PhysioBoo.Application.ViewModels.Roles
{
    public sealed record CreateRoleViewModel
    (
        Guid Id,
        string Name,
        string Code,
        string? Description,
        string? Color,
        string? Icon
    );
}
