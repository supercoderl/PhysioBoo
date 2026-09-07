namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed record RejectStockTakeViewModel(string Reason);

    public sealed record ApproveStockTakeViewModel(string? Note);
}
