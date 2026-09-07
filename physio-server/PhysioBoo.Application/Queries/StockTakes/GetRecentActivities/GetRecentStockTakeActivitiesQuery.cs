
using PhysioBoo.Application.ViewModels.StockTakes;

namespace PhysioBoo.Application.Queries.StockTakes.GetRecentActivities
{
    public sealed record GetRecentStockTakeActivitiesQuery(int Limit) : IRequest<List<StockTakeActivityViewModel>>;
}
