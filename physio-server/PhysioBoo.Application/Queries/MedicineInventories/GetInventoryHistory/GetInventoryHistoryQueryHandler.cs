
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryHistory
{
    public sealed class GetInventoryHistoryQueryHandler : IRequestHandler<GetInventoryHistoryQuery, List<InventoryHistoryEntryViewModel>>
    {
        private readonly IStockMovementRepository _stockMovementRepository;

        public GetInventoryHistoryQueryHandler(IStockMovementRepository stockMovementRepository)
        {
            _stockMovementRepository = stockMovementRepository;
        }

        public async Task<List<InventoryHistoryEntryViewModel>> Handle(GetInventoryHistoryQuery request, CancellationToken ct)
        {
            List<StockMovement> movements = await _stockMovementRepository
                .GetAllNoTracking(
                    filter: m => m.MedicineId == request.MedicineId && (request.Type == null || m.Type == request.Type),
                    includeProperties: "MedicineInventory,PerformedByUser"
                )
                .OrderByDescending(m => m.OccurredAt)
                .ToListAsync(ct);

            return movements.Select(m => new InventoryHistoryEntryViewModel
            {
                Date = m.OccurredAt,
                Description = m.MedicineInventory?.BatchNumber != null
                    ? $"{m.Type} — batch {m.MedicineInventory.BatchNumber}"
                    : m.Type.ToString(),
                Quantity = m.Quantity,
                Reference = m.Reference,
                Actor = m.PerformedByUser?.Email ?? string.Empty
            }).ToList();
        }
    }
}
