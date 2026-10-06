namespace PhysioBoo.Application.ViewModels.Admissions
{
    // Patient, admission time, status and bed are not editable here: discharge and bed moves have their own endpoints.
    public sealed record UpdateAdmissionViewModel(
        string AdmissionType,
        Guid DepartmentId,
        Guid DoctorId,
        string? ReferredBy,
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
