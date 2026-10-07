using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetSamples
{
    public sealed record GetLabSamplesQuery(int PageNumber, int PageSize) : IRequest<PagedResult<LabSampleViewModel>>;
}
