using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class StockMovementViewModel
    {
        public Guid Id { get; set; }
        public StockMovementType Type { get; set; }
        public Guid MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string? BatchNo { get; set; }
        public int Quantity { get; set; }
        public string? WarehouseZone { get; set; }
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public string? Reference { get; set; }

        public static StockMovementViewModel FromStockMovement(Domain.Entities.Clinical.StockMovement entity)
        {
            return new StockMovementViewModel
            {
                Id = entity.Id,
                Type = entity.Type,
                MedicineId = entity.MedicineId,
                MedicineName = entity.Medicine?.Name ?? string.Empty,
                BatchNo = entity.MedicineInventory?.BatchNumber,
                Quantity = entity.Quantity,
                WarehouseZone = entity.WarehouseZone?.Name,
                PerformedBy = entity.PerformedByUser?.Email ?? string.Empty,
                OccurredAt = entity.OccurredAt,
                Reference = entity.Reference
            };
        }
    }
}
