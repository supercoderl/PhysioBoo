using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.PatientInformation
{
    public class PatientMedicalHistory : TenantEntity
    {
        #region Core Patient Medical History Table (16)
        public Guid PatientId { get; private set; }
        public string ConditionName { get; private set; }
        public string? ConditionCategory { get; private set; }
        public string? Icd10Code { get; private set; }
        public DateOnly? DiagnosedDate { get; private set; }
        public Guid? DiagnosedBy { get; private set; }
        public Guid? DiagnosisHospitalId { get; private set; }
        public Severity Severity { get; private set; }
        public CurrentStatus CurrentStatus { get; private set; }
        public string? TreatmentSummary { get; private set; }
        public string? MedicationsPrescribed { get; private set; }
        public bool FollowUpRequired { get; private set; }
        public DateOnly? NextReviewDate { get; private set; }
        public string? Notes { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual Doctor? DiagnosedDoctor { get; private set; }
        public virtual Hospital? DiagnosisHospital { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (16)
        public PatientMedicalHistory(
            Guid id,
            Guid patientId,
            string conditionName,
            string? conditionCategory,
            string? icd10Code,
            DateOnly? diagnosedDate,
            Guid? diagnosedBy,
            Guid? diagnosisHospitalId,
            Severity severity,
            CurrentStatus currentStatus,
            string? treatmentSummary,
            string? medicationsPrescribed,
            DateOnly? nextReviewDate,
            string? notes
        ) : base(id)
        {
            PatientId = patientId;
            ConditionName = conditionName;
            ConditionCategory = conditionCategory;
            Icd10Code = icd10Code;
            DiagnosedDate = diagnosedDate;
            DiagnosedBy = diagnosedBy;
            DiagnosisHospitalId = diagnosisHospitalId;
            Severity = severity;
            CurrentStatus = currentStatus;
            TreatmentSummary = treatmentSummary;
            MedicationsPrescribed = medicationsPrescribed;
            FollowUpRequired = false;
            NextReviewDate = nextReviewDate;
            Notes = notes;
        }
        #endregion

        #region Setter Methods (16)
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetConditionName(string conditionName) { ConditionName = conditionName; }
        public void SetConditionCategory(string? conditionCategory) { ConditionCategory = conditionCategory; }
        public void SetIcd10Code(string? icd10Code) { Icd10Code = icd10Code; }
        public void SetDiagnosedDate(DateOnly? diagnosedDate) { DiagnosedDate = diagnosedDate; }
        public void SetDiagnosedBy(Guid? diagnosedBy) { DiagnosedBy = diagnosedBy; }
        public void SetDiagnosisHospitalId(Guid? diagnosisHospitalId) { DiagnosisHospitalId = diagnosisHospitalId; }
        public void SetSeverity(Severity severity) { Severity = severity; }
        public void SetCurrentStatus(CurrentStatus currentStatus) { CurrentStatus = currentStatus; }
        public void SetTreatmentSummary(string? treatmentSummary) { TreatmentSummary = treatmentSummary; }
        public void SetMedicationsPrescribed(string? medicationsPrescribed) { MedicationsPrescribed = medicationsPrescribed; }
        public void SetFollowUpRequired(bool followUpRequired) { FollowUpRequired = followUpRequired; }
        public void SetNextReviewDate(DateOnly? nextReviewDate) { NextReviewDate = nextReviewDate; }
        public void SetNotes(string? notes) { Notes = notes; }
        #endregion
    }
}
