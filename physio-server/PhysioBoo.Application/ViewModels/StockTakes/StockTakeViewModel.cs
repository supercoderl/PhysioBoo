using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeViewModel
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public Guid WarehouseId { get; set; } // = HospitalId
        public string WarehouseName { get; set; } = string.Empty;
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public string? AssignedToName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateOnly ScheduledDate { get; set; }
        public string Status { get; set; } = "Draft";
        public int ItemsCount { get; set; }
        public decimal CompletedPercent { get; set; }
        public decimal DifferenceValue { get; set; }
        public DateTime LastUpdated { get; set; }
        public string? Notes { get; set; }
        public string? RejectionReason { get; set; }

        public static StockTakeViewModel FromStockTake(StockTake s)
        {
            int itemsCount = s.StockTakeItems.Count;
            int countedCount = s.StockTakeItems.Count(i => i.IsCounted);

            return new StockTakeViewModel
            {
                Id = s.Id,
                Code = s.Code,
                WarehouseId = s.HospitalId,
                WarehouseName = s.Hospital?.Name ?? string.Empty,
                DepartmentId = s.DepartmentId,
                DepartmentName = s.Department?.Name ?? string.Empty,
                CreatedByName = s.Creator?.Email ?? string.Empty,
                AssignedToName = s.AssignedToUser?.Email,
                CreatedDate = s.CreatedAt,
                ScheduledDate = s.ScheduledDate,
                Status = s.Status.ToString(),
                ItemsCount = itemsCount,
                CompletedPercent = itemsCount == 0 ? 0 : Math.Round(100m * countedCount / itemsCount, 1),
                DifferenceValue = s.StockTakeItems
                    .Where(i => i.IsCounted)
                    .Sum(i => i.Difference() * (i.MedicineInventory?.UnitPurchasePrice ?? 0)),
                LastUpdated = s.UpdatedAt ?? s.CreatedAt,
                Notes = s.Notes,
                RejectionReason = s.RejectionReason
            };
        }
    }
}
