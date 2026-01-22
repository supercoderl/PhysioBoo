namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record RoleForAssigningViewModel
    (
        Guid UserId,
        Dictionary<string, bool> Roles,
        Guid? AssignerId
    );
}
