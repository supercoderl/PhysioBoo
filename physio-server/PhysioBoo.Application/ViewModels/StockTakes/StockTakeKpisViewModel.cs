namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeKpisViewModel
    {
        public int ActiveSessions { get; set; }
        public int PendingApproval { get; set; }
        public int CompletedThisMonth { get; set; }
        public decimal TotalDifferenceValue { get; set; }
        public int DiscrepancySessions { get; set; }
    }
}
