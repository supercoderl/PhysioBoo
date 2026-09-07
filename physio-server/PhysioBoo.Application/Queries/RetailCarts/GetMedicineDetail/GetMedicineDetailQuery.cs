
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetMedicineDetail
{
    public sealed record GetMedicineDetailQuery(Guid MedicineId) : IRequest<RetailMedicineDetailViewModel?>;
}
