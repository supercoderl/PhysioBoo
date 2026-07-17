using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class ClinicalNoteViewModel
    {
        public Guid Id { get; set; }
        public string RecordNumber { get; set; } = string.Empty;
        public RecordType RecordType { get; set; }
        public string RecordDate { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string? AppointmentNumber { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? HistoryOfPresentIllness { get; set; }
        public string? PhysicalExamination { get; set; }
        public string? ProvisionalDiagnosis { get; set; }
        public string? FinalDiagnosis { get; set; }
        public IReadOnlyList<string> Icd10Codes { get; set; } = Array.Empty<string>();
        public string? TreatmentPlan { get; set; }
        public string? FollowUpInstructions { get; set; }
        public string? DoctorNotes { get; set; }
        public string? DischargeSummary { get; set; }
        public bool IsConfidential { get; set; }
        public AccessLevel AccessLevel { get; set; }

        public static ClinicalNoteViewModel FromMedicalRecord(MedicalRecord medicalRecord)
        {
            return new ClinicalNoteViewModel
            {
                Id = medicalRecord.Id,
                RecordNumber = medicalRecord.RecordNumber,
                RecordType = medicalRecord.RecordType,
                RecordDate = TimeZoneHelper.ConvertDateTimeToString(medicalRecord.RecordDate, DateFormats.IsoDate),
                DoctorName = medicalRecord.Doctor?.User?.Profile?.FullName ?? string.Empty,
                AppointmentNumber = medicalRecord.Appointment?.AppointmentNumber ?? string.Empty,
                ChiefComplaint = medicalRecord.ChiefComplaint,
                HistoryOfPresentIllness = medicalRecord.HistoryOfPresentIllness,
                PhysicalExamination = medicalRecord.PhysicalExamination,
                ProvisionalDiagnosis = medicalRecord.ProvisionalDiagnosis,
                FinalDiagnosis = medicalRecord.FinalDiagnosis,
                Icd10Codes = medicalRecord.Icd10Codes,
                TreatmentPlan = medicalRecord.TreatmentPlan,
                FollowUpInstructions = medicalRecord.FollowUpInstructions,
                DoctorNotes = medicalRecord.DoctorNotes,
                DischargeSummary = medicalRecord.DischargeSummary,
                IsConfidential = medicalRecord.IsConfidential,
                AccessLevel = medicalRecord.AccessLevel
            };
        }
    }
}
