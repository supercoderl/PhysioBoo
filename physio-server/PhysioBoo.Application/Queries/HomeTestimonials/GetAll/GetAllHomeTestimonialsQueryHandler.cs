using PhysioBoo.Application.ViewModels.HomeContent;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HomeTestimonials.GetAll
{
    public sealed class GetAllHomeTestimonialsQueryHandler : IRequestHandler<GetAllHomeTestimonialsQuery, PagedResult<HomeTestimonialViewModel>>
    {
        private readonly IHomeTestimonialRepository _repository;
        private readonly ISortingExpressionProvider<HomeTestimonialViewModel, HomeTestimonial> _sortingExpressionProvider;

        public GetAllHomeTestimonialsQueryHandler(
            IHomeTestimonialRepository repository,
            ISortingExpressionProvider<HomeTestimonialViewModel, HomeTestimonial> sortingExpressionProvider
        )
        {
            _repository = repository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<HomeTestimonialViewModel>> Handle(GetAllHomeTestimonialsQuery q, CancellationToken ct)
        {
            HomeTestimonialsSearchSpec spec = new HomeTestimonialsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<HomeTestimonial> paged = await _repository.ListAsync(spec, q.Request.PageNumber, q.Request.PageSize, ct);

            List<HomeTestimonialViewModel> items = paged.Items.Select(HomeTestimonialViewModel.FromEntity).ToList();
            return new PagedResult<HomeTestimonialViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
