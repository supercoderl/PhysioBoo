namespace PhysioBoo.Application.ViewModels.Patients
{
    public sealed record CreatePatientViewModel
    (
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
        string? CommunicationPreferences
    );
}
