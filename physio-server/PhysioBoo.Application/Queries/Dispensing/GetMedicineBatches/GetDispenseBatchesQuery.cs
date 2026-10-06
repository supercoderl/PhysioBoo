using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Application.Queries.Dispensing.GetMedicineBatches
{
    public sealed record GetDispenseBatchesQuery(Guid MedicineId) : IRequest<List<DispenseBatchOptionViewModel>>;
}
