using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.BedMap.SearchBeds
{
    public sealed record SearchBedsQuery(PagedRequest<BedFilter> Request) : IRequest<PagedResult<BedViewModel>>;
}
