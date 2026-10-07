namespace PhysioBoo.Application.ViewModels.Invites
{
    public sealed record TenantInviteViewModel(
        Guid Id,
        string? Email,
        string IntendedRole,
        DateTime InvitedAt,
        DateTime ExpiresAt
    );
}
