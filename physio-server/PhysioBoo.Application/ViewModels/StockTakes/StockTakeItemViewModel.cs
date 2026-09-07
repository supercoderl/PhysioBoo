using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeItemViewModel
    {
        public Guid Id { get; set; }
        public string? Barcode { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string CategoryType { get; set; } = "Medicine"; // Medicine-only for this pass
        public Guid CategoryId { get; set; }
        public string? BatchNo { get; set; }
        public DateOnly? ExpiryDate { get; set; }
        public int SystemQty { get; set; }
        public int? ActualQty { get; set; }
        public int Difference { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public bool IsCounted { get; set; }

        public static StockTakeItemViewModel FromStockTakeItem(StockTakeItem item)
        {
            return new StockTakeItemViewModel
            {
                Id = item.Id,
                Barcode = item.MedicineInventory?.Medicine?.Barcode,
                ItemCode = item.MedicineInventory?.Medicine?.DrugCode ?? string.Empty,
                ItemName = item.MedicineInventory?.Medicine?.Name ?? string.Empty,
                Unit = item.MedicineInventory?.Medicine?.DosageForm.ToString() ?? string.Empty,
                CategoryId = item.MedicineInventory?.Medicine?.CategoryId ?? Guid.Empty,
                BatchNo = item.MedicineInventory?.BatchNumber,
                ExpiryDate = item.MedicineInventory?.ExpiryDate,
                SystemQty = item.SystemQty,
                ActualQty = item.ActualQty,
                Difference = item.Difference(),
                Reason = item.Reason,
                Notes = item.Notes,
                IsCounted = item.IsCounted
            };
        }
    }
}
