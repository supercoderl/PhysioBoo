
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetStockMovements
{
    public sealed class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, PagedResult<StockMovementViewModel>>
    {
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetStockMovementsQueryHandler(IStockMovementRepository stockMovementRepository)
        {
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<PagedResult<StockMovementViewModel>> Handle(GetStockMovementsQuery request, CancellationToken ct)
        {
            PagedResult<StockMovement> paged = await _stockMovementRepository.GetPagedAsync(
                pageNumber: request.PageNumber,
                pageSize: request.PageSize,
                orderBy: q => q.OrderByDescending(m => m.OccurredAt),
                includeProperties: "Medicine,MedicineInventory,WarehouseZone,PerformedByUser",
                ct: ct
            );

            List<StockMovementViewModel> items = paged.Items.Select(m => StockMovementViewModel.FromStockMovement(m)).ToList();
            return new PagedResult<StockMovementViewModel>(paged.TotalCount, items, request.PageNumber, request.PageSize);
        }
    }
}
