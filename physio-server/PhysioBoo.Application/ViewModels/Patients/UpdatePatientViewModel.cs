using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Patients
{
    public sealed record UpdatePatientViewModel
    (
        PatientType PatientType,
        Guid PrimaryDoctorId,
        Guid? PreferredHospitalId,
        Guid? PreferredDoctorId,
        string? PreferredAppointmentTime,
        string? InssuranceProvider,
        string? InssurancePolicyNumber,
        DateOnly? InssuranceExpiryDate,
        decimal? InssuranceCoverageAmount,
        bool IsVip,
        bool IsSeniorCitizen,
        bool IsChronicPatient,
        RiskLevel RiskLevel,
        string? MedicalHistory,
        string? FamilyHistory,
        string? SurgicalHistory,
        string? AllergyInformation,
        string? CurrentMedications,
        string? LifestyleNotes,
        string? Occupation,
        string? AnnualIncomeRange,
        string? CommunicationPreferences,
        bool ConsentForResearch,
        bool ConsentForMarketing,
        bool DataSharingConsent
    );
}
