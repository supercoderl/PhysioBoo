using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.Export
{
    public sealed record ExportStockTakesQuery(StockTakeFilter? Filter, string? Search) : IRequest<byte[]>;
}
