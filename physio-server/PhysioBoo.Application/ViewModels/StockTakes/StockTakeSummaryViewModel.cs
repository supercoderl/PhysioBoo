namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeSummaryViewModel
    {
        public int TotalItems { get; set; }
        public int CountedItems { get; set; }
        public int RemainingItems { get; set; }
        public int PositiveDifferenceCount { get; set; }
        public int NegativeDifferenceCount { get; set; }
        public decimal ValueDifference { get; set; }
        public decimal CompletionPercent { get; set; }
    }
}
