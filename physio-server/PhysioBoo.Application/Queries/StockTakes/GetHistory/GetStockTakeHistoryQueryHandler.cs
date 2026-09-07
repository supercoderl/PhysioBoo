
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.StockTakes.GetHistory
{
    public sealed class GetStockTakeHistoryQueryHandler : IRequestHandler<GetStockTakeHistoryQuery, List<StockTakeActivityViewModel>>
    {
        private readonly IStockTakeActivityRepository _stockTakeActivityRepository;

        public GetStockTakeHistoryQueryHandler(IStockTakeActivityRepository stockTakeActivityRepository)
        {
            _stockTakeActivityRepository = stockTakeActivityRepository;
        }

        public async Task<List<StockTakeActivityViewModel>> Handle(GetStockTakeHistoryQuery request, CancellationToken ct)
        {
            List<StockTakeActivity> activities = await _stockTakeActivityRepository
                .GetAllNoTracking(filter: a => a.StockTakeId == request.StockTakeId, includeProperties: "StockTake,ActorUser")
                .OrderByDescending(a => a.OccurredAt)
                .ToListAsync(ct);

            return activities.Select(a => StockTakeActivityViewModel.FromStockTakeActivity(a)).ToList();
        }
    }
}
