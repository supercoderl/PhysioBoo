namespace PhysioBoo.Application.ViewModels.Inventory
{
    public sealed class StockInsightViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public string Tone { get; set; } = "neutral"; // primary | success | warning | danger | neutral
    }
}
