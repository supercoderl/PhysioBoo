namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class InventoryKpisViewModel
    {
        public decimal TotalInventoryValue { get; set; }
        public int TotalMedicines { get; set; }
        public int AvailableStock { get; set; }
        public int ReservedStock { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public int NearExpiryCount { get; set; }
        public int ExpiredCount { get; set; }
        public int TodayMovementsCount { get; set; }
        // No purchase-order entity exists yet in this codebase — always 0 until one is added.
        public int PendingPurchaseOrders { get; set; }
    }
}
