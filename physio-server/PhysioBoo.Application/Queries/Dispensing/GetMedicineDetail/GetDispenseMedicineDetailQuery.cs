using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Application.Queries.Dispensing.GetMedicineDetail
{
    public sealed record GetDispenseMedicineDetailQuery(Guid MedicineId) : IRequest<DispenseMedicineDetailViewModel?>;
}
