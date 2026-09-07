namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed class StockTakeCategoryNodeViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "Medicine";
        public int ItemCount { get; set; }
        public int CountedCount { get; set; }
    }
}
