namespace PhysioBoo.Application.ViewModels.Admissions
{
    // Existing patients only: register a new patient first, then admit them.
    // When BedId is given, the bed is assigned in the same transaction as the admission.
    public sealed record CreateAdmissionViewModel(
        Guid PatientId,
        string AdmissionType,
        DateTime AdmittedAt,
        Guid DepartmentId,
        Guid DoctorId,
        string? ReferredBy,
        Guid? BedId,
        DateTime? ExpectedDischargeDate,
        string ChiefComplaint,
        string ProvisionalDiagnosis,
        string? Allergies,
        string? CurrentMedications,
        string? MedicalHistory,
        bool HasInsurance,
        string? InsuranceProvider,
        string? PolicyNumber
    );
}
