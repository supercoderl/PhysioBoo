using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetLabs
{
    public sealed record GetTreatmentLabsQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<TreatmentLabOrderRowViewModel>>;
}
