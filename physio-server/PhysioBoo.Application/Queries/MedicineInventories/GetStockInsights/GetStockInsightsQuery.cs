
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetStockInsights
{
    public sealed record GetStockInsightsQuery(Guid? MedicineId) : IRequest<List<StockInsightViewModel>>;
}
