using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeBanners.GetAll
{
    public sealed record GetAllHomeBannersQuery(
        PagedRequest<HomeBannerFilter> Request
    ) : IRequest<PagedResult<HomeBannerViewModel>>;
}
