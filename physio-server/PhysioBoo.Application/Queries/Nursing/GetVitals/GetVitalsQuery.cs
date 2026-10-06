using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetVitals
{
    public sealed record GetVitalsQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<VitalsReadingViewModel>>;
}
