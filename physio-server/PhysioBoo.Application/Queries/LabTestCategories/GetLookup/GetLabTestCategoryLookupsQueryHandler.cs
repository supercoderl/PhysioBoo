using MediatR;
using PhysioBoo.Application.ViewModels;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetLookup
{
    public sealed class GetLabTestCategoryLookupsQueryHandler : IRequestHandler<GetLabTestCategoryLookupsQuery, PagedResult<LabTestCategoryLookupViewModel>>
    {
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;

        public GetLabTestCategoryLookupsQueryHandler(
            ILabTestCategoryRepository labTestCategoryRepository
        )
        {
            _labTestCategoryRepository = labTestCategoryRepository;
        }

        public async Task<PagedResult<LabTestCategoryLookupViewModel>> Handle(GetLabTestCategoryLookupsQuery q, CancellationToken ct)
        {
            PagedResult<LabTestCategory> paged = await _labTestCategoryRepository.ListAsync(
                new DefaultSpec<LabTestCategory>(),
                1,
                100,
                ct
            );

            // Map to view model
            List<LabTestCategoryLookupViewModel> items = paged.Items.Select(ltc => LabTestCategoryLookupViewModel.FromLabTestCategory(ltc)).ToList();
            return new PagedResult<LabTestCategoryLookupViewModel>(paged.TotalCount, items, 1, 100);
        }
    }
}
