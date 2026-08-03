using MediatR;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineCategories.GetAll
{
    public sealed class GetAllMedicineCategoriesQueryHandler : IRequestHandler<GetAllMedicineCategoriesQuery, PagedResult<MedicineCategoryViewModel>>
    {
        private readonly IMedicineCategoryRepository _medicineCategoryRepository;
        private readonly ISortingExpressionProvider<MedicineCategoryViewModel, MedicineCategory> _sortingExpressionProvider;

        public GetAllMedicineCategoriesQueryHandler(
            IMedicineCategoryRepository medicineCategoryRepository,
            ISortingExpressionProvider<MedicineCategoryViewModel, MedicineCategory> sortingExpressionProvider
        )
        {
            _medicineCategoryRepository = medicineCategoryRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<MedicineCategoryViewModel>> Handle(GetAllMedicineCategoriesQuery q, CancellationToken ct)
        {
            MedicineCategoriesSearchSpec spec = new MedicineCategoriesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<MedicineCategory> paged = await _medicineCategoryRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<MedicineCategoryViewModel> items = paged.Items.Select(mc => MedicineCategoryViewModel.FromMedicineCategory(mc)).ToList();
            return new PagedResult<MedicineCategoryViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
