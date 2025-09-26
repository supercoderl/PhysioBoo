using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed record CreateMedicalRecordViewModel
    (
        Guid Id,
        string RecordNumber,
        Guid PatientId,
        Guid AppointmentId,
        Guid DoctorId,
        Guid HospitalId,
        RecordType RecordType,
        string? ChiefComplaint,
        string? HistoryOfPresentIllness,
        string? PastMedicalHistory,
        string? FamilyHistory,
        string? SocialHistory,
        string? ReviewOfSystems,
        string? PhysicalExamination,
        string? VitalSigns,
        string? ClinicalFindings,
        string? ProvisionalDiagnosis,
        string? FinalDiagnosis,
        string[] Icd10Codes,
        string? DifferencentialDiagnosis,
        string? TreatmentPlan,
        string? MedicationsPrescribed,
        string? ProceduresPerformed,
        string? InvestigationsOrdered,
        string? FollowUpInstructions,
        string? Prognosis,
        string? DoctorNotes,
        string? PatientEducationProvided,
        string? DischargeSummary
    );
}
