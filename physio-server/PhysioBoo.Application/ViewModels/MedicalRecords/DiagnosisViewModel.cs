using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class DiagnosisViewModel
    {
        public Guid Id { get; set; }
        public string ConditionName { get; set; } = string.Empty;
        public string? ConditionCategory { get; set; }
        public string? Icd10Code { get; set; }
        public string? DiagnosedDate { get; set; }
        public string? DiagnosedByName { get; set; }
        public string? DiagnosisHospitalName { get; set; }
        public Severity Severity { get; set; }
        public CurrentStatus CurrentStatus { get; set; }
        public string? TreatmentSummary { get; set; }
        public string? MedicationPrescribed { get; set; }
        public bool FollowUpRequired { get; set; }
        public string? NextReviewDate { get; set; }
        public string? Notes { get; set; }

        public static DiagnosisViewModel FromPatientMedicalHistory(PatientMedicalHistory patientMedicalHistory)
        {
            return new DiagnosisViewModel
            {
                Id = patientMedicalHistory.Id,
                ConditionName = patientMedicalHistory.ConditionName,
                ConditionCategory = patientMedicalHistory.ConditionCategory,
                Icd10Code = patientMedicalHistory.Icd10Code,
                DiagnosedDate = TimeZoneHelper.ConvertDateTimeToString(patientMedicalHistory.DiagnosedDate, DateFormats.IsoDate),
                DiagnosedByName = patientMedicalHistory.DiagnosedDoctor?.User?.Profile?.FullName,
                DiagnosisHospitalName = patientMedicalHistory.DiagnosisHospital?.Name,
                Severity = patientMedicalHistory.Severity,
                CurrentStatus = patientMedicalHistory.CurrentStatus,
                TreatmentSummary = patientMedicalHistory.TreatmentSummary,
                MedicationPrescribed = patientMedicalHistory.MedicationsPrescribed,
                FollowUpRequired = patientMedicalHistory.FollowUpRequired,
                NextReviewDate = TimeZoneHelper.ConvertDateTimeToString(patientMedicalHistory.NextReviewDate, DateFormats.IsoDate),
                Notes = patientMedicalHistory.Notes
            };
        }
    }
}
