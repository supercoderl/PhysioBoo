using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetAll
{
    public sealed class GetAllLabTestCategoriesQueryHandler : IRequestHandler<GetAllLabTestCategoriesQuery, PagedResult<LabTestCategoryViewModel>>
    {
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;
        private readonly ISortingExpressionProvider<LabTestCategoryViewModel, LabTestCategory> _sortingExpressionProvider;

        public GetAllLabTestCategoriesQueryHandler(
            ILabTestCategoryRepository labTestCategoryRepository,
            ISortingExpressionProvider<LabTestCategoryViewModel, LabTestCategory> sortingExpressionProvider
        )
        {
            _labTestCategoryRepository = labTestCategoryRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<LabTestCategoryViewModel>> Handle(GetAllLabTestCategoriesQuery q, CancellationToken cancellationToken)
        {
            LabTestCategoriesSearchSpec spec = new LabTestCategoriesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<LabTestCategory> paged = await _labTestCategoryRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<LabTestCategoryViewModel> items = paged.Items.Select(ltc => LabTestCategoryViewModel.FromLabTestCategory(ltc)).ToList();
            return new PagedResult<LabTestCategoryViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
