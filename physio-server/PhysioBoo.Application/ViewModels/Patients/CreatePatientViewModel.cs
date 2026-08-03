using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Patients
{
    public sealed record CreatePatientViewModel
    (
        Guid? UserId,
        Guid PrimaryDoctorId,
        Guid? ReferredBy,
        Guid? ReferralHospitalId,
        string? InssuranceProvider,
        string? InssurancePolicyNumber,
        DateOnly? InssuranceExpiryDate,
        decimal? InssuranceCoverageAmount,
        string? MedicalHistory,
        string? FamilyHistory,
        string? SurgicalHistory,
        string? AllergyInformation,
        string? CurrentMedications,
        string? LifestyleNotes,
        string? Occupation,
        string? AnnualIncomeRange,
        Guid? PreferredHospitalId,
        Guid? PreferredDoctorId,
        string? PreferredAppointmentTime,
        string? CommunicationPreferences,
        CreatePatientProfileViewModel Profile
    );

    public sealed record CreatePatientProfileViewModel(
        string FirstName,
        string LastName,
        DateOnly DateOfBirth,
        Gender Gender,
        BloodGroup BloodGroup,
        MaritalStatus MaritalStatus,
        string Email,
        string Phone,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? Address,
        string? City,
        string? PostalCode
    );
}
