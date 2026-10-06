using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class IntakeOutputEntryViewModel
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public DateTime RecordedAt { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;   // "Intake" | "Output"
        public string Category { get; set; } = string.Empty;    // "Oral" | "IV" | "Urine" | "Drain" | "Other"
        public int VolumeMl { get; set; }
        public string? Notes { get; set; }

        public static IntakeOutputEntryViewModel FromEntity(IntakeOutputEntry entity)
        {
            return new IntakeOutputEntryViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                RecordedAt = entity.RecordedAt,
                RecordedBy = entity.RecordedByName,
                Direction = entity.Direction.ToString(),
                Category = entity.Category.ToString(),
                VolumeMl = entity.VolumeMl,
                Notes = entity.Notes
            };
        }
    }
}
