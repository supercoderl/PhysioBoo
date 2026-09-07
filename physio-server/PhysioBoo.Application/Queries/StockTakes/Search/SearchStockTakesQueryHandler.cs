
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.StockTakes;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.StockTakes.Search
{
    public sealed class SearchStockTakesQueryHandler : IRequestHandler<SearchStockTakesQuery, PagedResult<StockTakeViewModel>>
    {
        private readonly IStockTakeRepository _stockTakeRepository;

        public SearchStockTakesQueryHandler(IStockTakeRepository stockTakeRepository)
        {
            _stockTakeRepository = stockTakeRepository;
        }

        public async Task<PagedResult<StockTakeViewModel>> Handle(SearchStockTakesQuery q, CancellationToken ct)
        {
            PagedRequest<StockTakeFilter> request = q.Request;

            IQueryable<StockTake> query = _stockTakeRepository
                .GetAllNoTracking(includeProperties: "Hospital,Department,Creator,AssignedToUser,StockTakeItems.MedicineInventory")
                .OrderByDescending(s => s.CreatedAt);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim().ToLower();
                query = query.Where(s => s.Code.ToLower().Contains(term)).OrderByDescending(s => s.CreatedAt);
            }

            if (request.Filter != null)
            {
                if (request.Filter.WarehouseId != null)
                    query = query.Where(s => s.HospitalId == request.Filter.WarehouseId.Value).OrderByDescending(s => s.CreatedAt);

                if (request.Filter.DepartmentId != null)
                    query = query.Where(s => s.DepartmentId == request.Filter.DepartmentId.Value).OrderByDescending(s => s.CreatedAt);

                if (!string.IsNullOrWhiteSpace(request.Filter.Status) && Enum.TryParse(request.Filter.Status, out StockTakeStatus status))
                    query = query.Where(s => s.Status == status).OrderByDescending(s => s.CreatedAt);

                if (request.Filter.DateFrom != null)
                    query = query.Where(s => s.ScheduledDate >= request.Filter.DateFrom.Value).OrderByDescending(s => s.CreatedAt);

                if (request.Filter.DateTo != null)
                    query = query.Where(s => s.ScheduledDate <= request.Filter.DateTo.Value).OrderByDescending(s => s.CreatedAt);
            }

            int totalCount = await query.CountAsync(ct);
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            List<StockTake> pageItems = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<StockTakeViewModel> items = pageItems.Select(s => StockTakeViewModel.FromStockTake(s)).ToList();
            return new PagedResult<StockTakeViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
