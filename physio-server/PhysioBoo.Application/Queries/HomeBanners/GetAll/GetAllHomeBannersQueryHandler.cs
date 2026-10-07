using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeBanners.GetAll
{
    public sealed class GetAllHomeBannersQueryHandler : IRequestHandler<GetAllHomeBannersQuery, PagedResult<HomeBannerViewModel>>
    {
        private readonly IHomeBannerRepository _repository;
        private readonly ISortingExpressionProvider<HomeBannerViewModel, HomeBanner> _sortingExpressionProvider;

        public GetAllHomeBannersQueryHandler(
            IHomeBannerRepository repository,
            ISortingExpressionProvider<HomeBannerViewModel, HomeBanner> sortingExpressionProvider
        )
        {
            _repository = repository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<HomeBannerViewModel>> Handle(GetAllHomeBannersQuery q, CancellationToken ct)
        {
            HomeBannersSearchSpec spec = new HomeBannersSearchSpec(q, _sortingExpressionProvider);

            PagedResult<HomeBanner> paged = await _repository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, ct);

            List<HomeBannerViewModel> items = paged.Items.Select(HomeBannerViewModel.FromEntity).ToList();
            return new PagedResult<HomeBannerViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
