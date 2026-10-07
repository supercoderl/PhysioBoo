using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeFeatures.GetAll
{
    public sealed record GetAllHomeFeaturesQuery(
        PagedRequest<HomeFeatureFilter> Request
    ) : IRequest<PagedResult<HomeFeatureViewModel>>;
}
