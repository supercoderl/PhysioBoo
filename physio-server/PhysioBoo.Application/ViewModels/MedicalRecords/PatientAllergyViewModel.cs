using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class PatientAllergyViewModel
    {
        public Guid Id { get; set; }
        public string AllergenName { get; set; } = string.Empty;
        public AllergenType AllergenType { get; set; }
        public string? ReactionType { get; set; }
        public Domain.Enums.Severity Severity { get; set; }
        public string? FirstOccurrenceDate { get; set; }
        public string? LastOccurrenceDate { get; set; }
        public string? TreatmentGiven { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }

        public static PatientAllergyViewModel FromPatientAllergy(PatientAllergy patientAllergy)
        {
            return new PatientAllergyViewModel
            {
                Id = patientAllergy.Id,
                AllergenName = patientAllergy.AllergenName,
                AllergenType = patientAllergy.AllergenType,
                ReactionType = patientAllergy.ReactionType,
                Severity = patientAllergy.Severity,
                FirstOccurrenceDate = TimeZoneHelper.ConvertDateTimeToString(patientAllergy.FirstOccurenceDate, DateFormats.Iso8601),
                LastOccurrenceDate = patientAllergy.LastOccurenceDate?.ToString("yyyy-MM-dd"),
                TreatmentGiven = patientAllergy.TreatmentGiven,
                Notes = patientAllergy.Notes,
                IsActive = patientAllergy.IsActive
            };
        }
    }
}
