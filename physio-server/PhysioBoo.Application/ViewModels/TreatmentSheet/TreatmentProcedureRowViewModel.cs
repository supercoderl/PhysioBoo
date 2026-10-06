using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentProcedureRowViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTime ScheduledTime { get; set; }
        public DateTime? CompletionTime { get; set; }
        public string? PerformerName { get; set; }

        public static TreatmentProcedureRowViewModel FromEntity(TreatmentProcedure entity)
        {
            return new TreatmentProcedureRowViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Status = entity.Status.ToString(),
                Department = entity.Department,
                ScheduledTime = entity.ScheduledAt,
                CompletionTime = entity.CompletedAt,
                PerformerName = entity.PerformerName
            };
        }
    }
}
