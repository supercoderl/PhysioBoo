
using PhysioBoo.Application.ViewModels.Inventory;

namespace PhysioBoo.Application.Queries.MedicineInventories.GetMedicineStockDetail
{
    public sealed record GetMedicineStockDetailQuery(Guid MedicineId) : IRequest<MedicineStockDetailViewModel?>;
}
