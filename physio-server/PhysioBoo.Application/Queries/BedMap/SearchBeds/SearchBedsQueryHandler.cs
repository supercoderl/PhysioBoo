using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.BedMap.SearchBeds
{
    public sealed class SearchBedsQueryHandler : IRequestHandler<SearchBedsQuery, PagedResult<BedViewModel>>
    {
        private readonly IBedRepository _bedRepository;
        private readonly ISortingExpressionProvider<BedViewModel, Bed> _sortingExpressionProvider;

        public SearchBedsQueryHandler(
            IBedRepository bedRepository,
            ISortingExpressionProvider<BedViewModel, Bed> sortingExpressionProvider
        )
        {
            _bedRepository = bedRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<BedViewModel>> Handle(SearchBedsQuery q, CancellationToken cancellationToken)
        {
            BedsSearchSpec spec = new BedsSearchSpec(q, _sortingExpressionProvider);
            PagedResult<Bed> paged = await _bedRepository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, cancellationToken);
            return new PagedResult<BedViewModel>(
                paged.TotalCount,
                paged.Items.Select(BedViewModel.FromEntity).ToList(),
                q.Request.PageNumber,
                q.Request.PageSize
            );
        }
    }
}
