using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeFeatures.GetAll
{
    public sealed class GetAllHomeFeaturesQueryHandler : IRequestHandler<GetAllHomeFeaturesQuery, PagedResult<HomeFeatureViewModel>>
    {
        private readonly IHomeFeatureRepository _repository;
        private readonly ISortingExpressionProvider<HomeFeatureViewModel, HomeFeature> _sortingExpressionProvider;

        public GetAllHomeFeaturesQueryHandler(
            IHomeFeatureRepository repository,
            ISortingExpressionProvider<HomeFeatureViewModel, HomeFeature> sortingExpressionProvider
        )
        {
            _repository = repository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<HomeFeatureViewModel>> Handle(GetAllHomeFeaturesQuery q, CancellationToken ct)
        {
            HomeFeaturesSearchSpec spec = new HomeFeaturesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<HomeFeature> paged = await _repository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, ct);

            List<HomeFeatureViewModel> items = paged.Items.Select(HomeFeatureViewModel.FromEntity).ToList();
            return new PagedResult<HomeFeatureViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
