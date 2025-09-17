using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record UpdateUserViewModel
    (
        Guid Id,
        string? Email = null,
        string? Phone = null,
        string? AlternatePhone = null,
        Role? Role = null,
        bool? IsActive = null,
        bool? IsVerified = null,
        bool? TwoFactorEnabled = null,
        string? TwoFactorSecret = null,
        string? ProfilePicture = null,
        string? PreferredLanguage = null,
        string? TimeZone = null
    );
}
