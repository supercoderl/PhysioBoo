using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Users
{
    /// <summary>The signed-in user's editable account details (Settings > Account). Enums travel as names.</summary>
    public sealed record MyAccountViewModel(
        string Email,
        string Phone,
        string? AlternatePhone,
        string? AvatarUrl,
        string FirstName,
        string? MiddleName,
        string LastName,
        DateOnly? DateOfBirth,
        string? Gender,
        string? MaritalStatus,
        string? Nationality,
        string? BloodGroup,
        string? PreferredCommunication,
        string? IdentificationType,
        string? IdentificationNumber,
        DateTime? IdentificationExpiry,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? EmergencyContactRelationship
    )
    {
        public static MyAccountViewModel FromUser(User user)
        {
            Profile? p = user.Profile;
            return new MyAccountViewModel(
                user.Email,
                user.Phone,
                user.AlternatePhone,
                user.ProfilePicture,
                p?.FirstName ?? string.Empty,
                p?.MiddleName,
                p?.LastName ?? string.Empty,
                p?.DateOfBirth,
                p?.Gender.ToString(),
                p?.MaritalStatus.ToString(),
                p?.Nationality,
                p?.BloodGroup.ToString(),
                p?.PreferredCommunication.ToString(),
                p?.IdentificationType,
                p?.IdentificationNumber,
                p?.IdentificationExpiry,
                p?.EmergencyContactName,
                p?.EmergencyContactPhone,
                p?.EmergencyContactRelationship
            );
        }
    }

    /// <summary>Update body for Settings > Account. Email is the sign-in identity and can't be changed here; null fields are left unchanged.</summary>
    public sealed record UpdateMyAccountViewModel(
        string? Phone,
        string? AlternatePhone,
        string? FirstName,
        string? MiddleName,
        string? LastName,
        DateOnly? DateOfBirth,
        string? Gender,
        string? MaritalStatus,
        string? Nationality,
        string? BloodGroup,
        string? PreferredCommunication,
        string? IdentificationType,
        string? IdentificationNumber,
        DateTime? IdentificationExpiry,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? EmergencyContactRelationship
    );
}
