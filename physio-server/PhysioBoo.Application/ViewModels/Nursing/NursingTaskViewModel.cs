using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class NursingTaskViewModel
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string Label { get; set; } = string.Empty;
        public DateTime DueAt { get; set; }
        public string Status { get; set; } = string.Empty;      // "Pending" | "Overdue" | "Completed" | "Cancelled"
        public string AssignedNurseName { get; set; } = string.Empty;

        public static NursingTaskViewModel FromEntity(NursingTask entity, DateTime now)
        {
            bool overdue = entity.Status == NursingTaskStatus.Pending && entity.DueAt < now;

            return new NursingTaskViewModel
            {
                Id = entity.Id,
                PatientId = entity.PatientId,
                Label = entity.Label,
                DueAt = entity.DueAt,
                Status = overdue ? "Overdue" : entity.Status.ToString(),
                AssignedNurseName = entity.AssignedNurseName ?? string.Empty
            };
        }
    }
}
