
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryAlerts
{
    public sealed class GetInventoryAlertsQueryHandler : IRequestHandler<GetInventoryAlertsQuery, List<InventoryAlertViewModel>>
    {
        private readonly IInventoryAlertRepository _inventoryAlertRepository;

        public GetInventoryAlertsQueryHandler(IInventoryAlertRepository inventoryAlertRepository)
        {
            _inventoryAlertRepository = inventoryAlertRepository;
        }

        public async Task<List<InventoryAlertViewModel>> Handle(GetInventoryAlertsQuery request, CancellationToken ct)
        {
            List<InventoryAlert> alerts = await _inventoryAlertRepository
                .GetAllNoTracking(
                    filter: a => request.MedicineId == null || a.MedicineId == request.MedicineId,
                    includeProperties: "Medicine"
                )
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync(ct);

            return alerts.Select(a => InventoryAlertViewModel.FromInventoryAlert(a)).ToList();
        }
    }
}
