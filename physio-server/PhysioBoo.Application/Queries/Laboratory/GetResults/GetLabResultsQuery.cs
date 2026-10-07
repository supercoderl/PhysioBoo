using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetResults
{
    public sealed record GetLabResultsQuery(int PageNumber, int PageSize) : IRequest<PagedResult<LabResultEntryViewModel>>;
}
