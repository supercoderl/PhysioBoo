using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class InventoryAlertViewModel
    {
        public Guid Id { get; set; }
        public InventoryAlertType Type { get; set; }
        public InventoryAlertSeverity Severity { get; set; }
        public Guid? MedicineId { get; set; }
        public string? MedicineName { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Recommendation { get; set; }
        public bool Acknowledged { get; set; }
        public DateTime CreatedAt { get; set; }

        public static InventoryAlertViewModel FromInventoryAlert(Domain.Entities.Clinical.InventoryAlert entity)
        {
            return new InventoryAlertViewModel
            {
                Id = entity.Id,
                Type = entity.Type,
                Severity = entity.Severity,
                MedicineId = entity.MedicineId,
                MedicineName = entity.Medicine?.Name,
                Message = entity.Message,
                Recommendation = entity.Recommendation,
                Acknowledged = entity.AcknowledgedAt.HasValue,
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
