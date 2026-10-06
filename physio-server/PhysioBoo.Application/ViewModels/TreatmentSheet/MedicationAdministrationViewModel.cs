using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class MedicationAdministrationViewModel
    {
        public Guid Id { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dose { get; set; } = string.Empty;
        public string Route { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
        public string Status { get; set; } = string.Empty;      // Scheduled | Given | Missed | Refused | Held
        public string? AdministeredByName { get; set; }
        public string? Notes { get; set; }

        public static MedicationAdministrationViewModel FromEntity(MedicationAdministration entity)
        {
            return new MedicationAdministrationViewModel
            {
                Id = entity.Id,
                MedicationName = entity.MedicationName,
                Dose = entity.Dose,
                Route = entity.Route,
                Frequency = entity.Frequency,
                ScheduledTime = entity.ScheduledAt,
                Status = entity.Status.ToString(),
                AdministeredByName = entity.AdministeredByName,
                Notes = entity.Notes
            };
        }
    }
}
