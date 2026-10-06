using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class MarEntryViewModel
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public string Status { get; set; } = string.Empty;       // "Due" | "Given" | "Missed" | "Held"
        public DateTime? GivenAt { get; set; }
        public string? GivenBy { get; set; }
        public string? Reason { get; set; }

        public static MarEntryViewModel FromEntity(MedicationAdministration entity)
        {
            return new MarEntryViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                MedicationName = entity.MedicationName,
                Dosage = entity.Dose,
                Route = entity.Route,
                ScheduledAt = entity.ScheduledAt,
                Status = ToNursingStatus(entity.Status),
                GivenAt = entity.AdministeredAt,
                GivenBy = entity.AdministeredByName,
                Reason = entity.Notes
            };
        }

        // Nursing has no "Scheduled" (it is "Due") and no "Refused" (shown as "Held").
        private static string ToNursingStatus(AdministrationStatus status)
        {
            return status switch
            {
                AdministrationStatus.Scheduled => "Due",
                AdministrationStatus.Refused => "Held",
                _ => status.ToString()
            };
        }
    }
}
