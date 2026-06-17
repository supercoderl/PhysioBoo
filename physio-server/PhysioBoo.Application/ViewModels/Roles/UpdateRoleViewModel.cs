namespace PhysioBoo.Application.ViewModels.Roles
{
    public sealed record UpdateRoleViewModel
    (
        string Name,
        string Code,
        string? Description,
        string? Color,
        string? Icon,
        bool IsSystemRole,
        bool IsActive,
        bool IsPublicForRegistration
    );
}
