
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryAlerts
{
    public sealed record GetInventoryAlertsQuery(Guid? MedicineId) : IRequest<List<InventoryAlertViewModel>>;
}
