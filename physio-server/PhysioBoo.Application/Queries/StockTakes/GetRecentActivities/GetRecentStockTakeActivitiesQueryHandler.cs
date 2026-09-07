
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetRecentActivities
{
    public sealed class GetRecentStockTakeActivitiesQueryHandler : IRequestHandler<GetRecentStockTakeActivitiesQuery, List<StockTakeActivityViewModel>>
    {
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;

        public GetRecentStockTakeActivitiesQueryHandler(IStockTakeActivityRepository stockTakeActivityRepository)
        {
            _stockTakeActivityRepository = stockTakeActivityRepository;
        }

        public async Task<List<StockTakeActivityViewModel>> Handle(GetRecentStockTakeActivitiesQuery request, CancellationToken ct)
        {
            int limit = request.Limit <= 0 ? 20 : request.Limit;

            List<StockTakeActivity> activities = await _stockTakeActivityRepository
                .GetAllNoTracking(includeProperties: "StockTake,ActorUser")
                .OrderByDescending(a => a.OccurredAt)
                .Take(limit)
                .ToListAsync(ct);

            return activities.Select(a => StockTakeActivityViewModel.FromStockTakeActivity(a)).ToList();
        }
    }
}
