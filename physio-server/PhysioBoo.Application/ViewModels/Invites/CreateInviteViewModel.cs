namespace PhysioBoo.Application.ViewModels.Invites
{
    public sealed record CreateInviteViewModel(
        Guid? HospitalId,
        Domain.Enums.Role IntendedRole,
        string? Email
    );
}
