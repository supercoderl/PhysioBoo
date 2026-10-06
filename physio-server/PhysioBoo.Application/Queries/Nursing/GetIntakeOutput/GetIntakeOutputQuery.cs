using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Nursing.GetIntakeOutput
{
    public sealed record GetIntakeOutputQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<IntakeOutputEntryViewModel>>;
}
