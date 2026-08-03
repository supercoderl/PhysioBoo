using MediatR;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.HospitalGroups.GetAll
{
    public sealed class GetAllHospitalGroupsQueryHandler : IRequestHandler<GetAllHospitalGroupsQuery, PagedResult<HospitalGroupViewModel>>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup> _sortingExpressionProvider;

        public GetAllHospitalGroupsQueryHandler(
            IHospitalGroupRepository hospitalGroupRepository,
            ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup> sortingExpressionProvider
        )
        {
            _hospitalGroupRepository = hospitalGroupRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<HospitalGroupViewModel>> Handle(GetAllHospitalGroupsQuery q, CancellationToken ct)
        {
            HospitalGroupsSearchSpec spec = new HospitalGroupsSearchSpec(q, _sortingExpressionProvider);

            PagedResult<HospitalGroup> paged = await _hospitalGroupRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<HospitalGroupViewModel> items = paged.Items.Select(hg => HospitalGroupViewModel.FromHospitalGroup(hg)).ToList();
            return new PagedResult<HospitalGroupViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
