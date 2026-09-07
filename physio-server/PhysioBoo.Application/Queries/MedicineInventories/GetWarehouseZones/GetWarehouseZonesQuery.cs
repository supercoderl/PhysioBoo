
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseZones
{
    public sealed record GetWarehouseZonesQuery() : IRequest<List<WarehouseZoneViewModel>>;
}
