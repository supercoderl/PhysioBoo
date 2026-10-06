using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentOrderViewModel
    {
        public Guid Id { get; set; }
        public string OrderType { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string? Frequency { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string OrderingDoctorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public static TreatmentOrderViewModel FromEntity(TreatmentOrder entity)
        {
            return new TreatmentOrderViewModel
            {
                Id = entity.Id,
                OrderType = entity.OrderType.ToString(),
                OrderName = entity.OrderName,
                Priority = entity.Priority.ToString(),
                Frequency = entity.Frequency,
                StartTime = entity.StartTime,
                EndTime = entity.EndTime,
                OrderingDoctorName = entity.OrderingDoctorName,
                Status = entity.Status.ToString()
            };
        }
    }
}
