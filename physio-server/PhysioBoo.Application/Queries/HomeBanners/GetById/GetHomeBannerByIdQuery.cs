using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Queries.HomeBanners.GetById
{
    public sealed record GetHomeBannerByIdQuery(Guid Id) : IRequest<HomeBannerViewModel?>;
}
