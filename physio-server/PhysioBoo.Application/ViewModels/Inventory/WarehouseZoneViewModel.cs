using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class WarehouseZoneViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public WarehouseZoneType Type { get; set; }
        // Placeholder until zones carry an explicit capacity figure to divide against —
        // currently expresses "how much is here" relative to the busiest zone, not a real limit.
        public decimal CapacityPercent { get; set; }
        public string ActivityLevel { get; set; } = "Low"; // Low | Medium | High
        public bool HasExpiringStock { get; set; }
        public bool IsEmpty { get; set; }
        public bool IsOverstocked { get; set; }
    }
}
