namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailInventoryInsightViewModel
    {
        public int LowStockCount { get; set; }
        public int NearExpiryCount { get; set; }
        public int OutOfStockCount { get; set; }
        public string? BestSellerName { get; set; }
        public int? BestSellerUnitsSold { get; set; }
        public decimal TodayRevenue { get; set; }
        public int TodaySalesCount { get; set; }
    }
}
