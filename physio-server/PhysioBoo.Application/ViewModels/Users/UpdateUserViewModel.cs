namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record UpdateUserViewModel
    (
        string Email,
        string Phone,
        string? AlternatePhone,
        bool IsActive,
        string? TwoFactorSecret,
        string? ProfilePicture,
        string PreferredLanguage,
        string TimeZone
    );
}
