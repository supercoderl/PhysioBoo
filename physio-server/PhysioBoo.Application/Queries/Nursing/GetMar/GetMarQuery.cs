using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetMar
{
    public sealed record GetMarQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<MarEntryViewModel>>;
}
