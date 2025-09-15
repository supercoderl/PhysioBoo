namespace PhysioBoo.Shared.Users
{
    public sealed record UserViewModel(
        Guid Id,
        string Email,
        string Phone,
        string? AlternatePhone,
        DateTimeOffset? DeletedAt
    );
}
