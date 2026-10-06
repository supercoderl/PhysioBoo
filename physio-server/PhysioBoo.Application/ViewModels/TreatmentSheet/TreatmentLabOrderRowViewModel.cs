using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    // Read-only view of the laboratory module's order items (LabOrder -> LabOrderItem).
    public sealed class TreatmentLabOrderRowViewModel
    {
        public Guid Id { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string SampleStatus { get; set; } = string.Empty;    // NotCollected | Collected | InTransit | Received
        public string ResultStatus { get; set; } = string.Empty;    // Pending | Partial | Final | Critical
        public bool IsCritical { get; set; }
        public DateTime OrderedAt { get; set; }

        public static TreatmentLabOrderRowViewModel FromEntity(LabOrderItem entity)
        {
            LabOrder? order = entity.LabOrder;

            return new TreatmentLabOrderRowViewModel
            {
                Id = entity.Id,
                TestName = entity.TestName,
                SampleStatus = entity.Status switch
                {
                    ItemStatus.Collected => "Collected",
                    ItemStatus.Processing or ItemStatus.Completed => "Received",
                    _ => entity.SampleCollected ? "Collected" : "NotCollected"
                },
                ResultStatus = entity.Status switch
                {
                    ItemStatus.Completed => entity.CritialFlag ? "Critical" : "Final",
                    ItemStatus.Processing => string.IsNullOrWhiteSpace(entity.ResultValue) ? "Pending" : "Partial",
                    _ => "Pending"
                },
                IsCritical = entity.CritialFlag,
                OrderedAt = order == null ? entity.CreatedAt : order.OrderDate.ToDateTime(order.OrderTime)
            };
        }
    }
}
