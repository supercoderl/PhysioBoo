using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.PatientMedicalHistories
{
    public sealed record CreatePatientMedicalHistoryViewModel
    (
        Guid Id,
        Guid PatientId,
        string ConditionName,
        string? ConditionCategory,
        string? Icd10Code,
        DateOnly? DiagnosedDate,
        Guid? DiagnosedBy,
        Guid? DiagnosisHospitalId,
        Severity Severity,
        CurrentStatus CurrentStatus,
        string? TreatmentSummary,
        string? MedicationsPrescribed,
        DateOnly? NextReviewDate,
        string? Notes
    );
}
