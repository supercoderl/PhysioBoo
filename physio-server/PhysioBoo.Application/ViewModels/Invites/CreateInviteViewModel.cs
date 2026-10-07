namespace PhysioBoo.Application.ViewModels.Invites
{
    public sealed record CreateInviteViewModel(
        Guid? HospitalId,
        // Role code, e.g. "NURSE" (no JsonStringEnumConverter is configured, so enums travel as strings).
        string IntendedRole,
        string? Email
    );
}
