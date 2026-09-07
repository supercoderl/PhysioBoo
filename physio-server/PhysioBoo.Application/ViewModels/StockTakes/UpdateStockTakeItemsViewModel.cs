namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed record StockTakeItemCountInput(
        Guid ItemId,
        int ActualQty,
        string? Reason,
        string? Notes
    );

    public sealed record UpdateStockTakeItemsViewModel(
        List<StockTakeItemCountInput> Items
    );
}
