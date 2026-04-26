using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Doctors
{
    public sealed record CreateDoctorViewModel
    (
        // User
        string Email,
        string Phone,
        string Password,

        // Profile
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
        PreferredCommunication PreferredCommunication,

        // Doctor
        string? Bio,
        string? About,
        string[] LanguagesSpoken,
        Guid? PrimarySpecialtyId,
        string MedicalLicenseNumber,
        DateOnly MedicalLicenseExpiry,
        string? MedicalLicenseIssuingAuthority,
        int YearsOfExperience,
        int YearsOfPractice,
        string? Archivements,
        string? ResearchInterests,
        int PublicationsCount,
        int ConferencePresentations,
        EmploymentStatus EmploymentStatus,
        string? BankAccountDetails,
        string? PanNumber,
        string? Gstin
    );
}
