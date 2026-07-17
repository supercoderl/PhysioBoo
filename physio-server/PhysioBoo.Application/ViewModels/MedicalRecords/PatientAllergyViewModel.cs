using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class PatientAllergyViewModel
    {
        public Guid Id { get; set; }
        public string AllergyName { get; set; } = string.Empty;
        public AllergenType AllergenType { get; set; }
        public string? ReactionType { get; set; }
        public Severity Severity { get; set; }
        public string? FirstOccurenceDate { get; set; }
        public string? LastOccurenceDate { get; set; }
        public string? TreatmentGiven { get; set; }
        public string? Note { get; set; }
        public bool IsActive { get; set; }

        public static PatientAllergyViewModel FromPatientAllergy(PatientAllergy patientAllergy)
        {
            return new PatientAllergyViewModel
            {
                Id = patientAllergy.Id,
                AllergyName = patientAllergy.AllergenName,
                AllergenType = patientAllergy.AllergenType,
                ReactionType = patientAllergy.ReactionType,
                Severity = patientAllergy.Severity,
                FirstOccurenceDate = TimeZoneHelper.ConvertDateTimeToString(patientAllergy.FirstOccurenceDate, DateFormats.Iso8601),
                LastOccurenceDate = patientAllergy.LastOccurenceDate?.ToString("yyyy-MM-dd"),
                TreatmentGiven = patientAllergy.TreatmentGiven,
                Note = patientAllergy.Notes,
                IsActive = patientAllergy.IsActive
            };
        }
    }
}
