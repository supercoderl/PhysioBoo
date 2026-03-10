using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTests.GetAll
{
    public sealed class GetAllLabTestsQueryHandler : IRequestHandler<GetAllLabTestsQuery, PagedResult<LabTestViewModel>>
    {
        private readonly ILabTestRepository _labTestRepository;
        private readonly ISortingExpressionProvider<LabTestViewModel, LabTest> _sortingExpressionProvider;

        public GetAllLabTestsQueryHandler(
            ILabTestRepository labTestRepository,
            ISortingExpressionProvider<LabTestViewModel, LabTest> sortingExpressionProvider
        )
        {
            _labTestRepository = labTestRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<LabTestViewModel>> Handle(GetAllLabTestsQuery q, CancellationToken cancellationToken)
        {
            LabTestsSearchSpec spec = new LabTestsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<LabTest> paged = await _labTestRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<LabTestViewModel> items = paged.Items.Select(lt => LabTestViewModel.FromLabTest(lt)).ToList();
            return new PagedResult<LabTestViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
