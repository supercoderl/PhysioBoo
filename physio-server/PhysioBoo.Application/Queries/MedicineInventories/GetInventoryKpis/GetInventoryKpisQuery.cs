
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetInventoryKpis
{
    public sealed record GetInventoryKpisQuery() : IRequest<InventoryKpisViewModel>;
}
