using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Profiles
{
    public sealed record CreateProfileViewModel
    (
        string FirstName,
        string LastName,
        string MiddleName,
        DateOnly DateOfBirth,
        Gender Gender,
        BloodGroup BloodGroup,
        MaritalStatus MaritalStatus,
        string? Nationality,
        string? IdentificationType,
        string? IdentificationNumber,
        DateTime? IdentificationExpiry,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? EmergencyContactRelationship,
        PreferredCommunication PreferredCommunication
    );
}
