
using Microsoft.EntityFrameworkCore;
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
        private readonly IHospitalRepository _hospitalRepository;
        private readonly ITenantSubscriptionRepository _subscriptionRepository;
        private readonly ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup> _sortingExpressionProvider;

        public GetAllHospitalGroupsQueryHandler(
            IHospitalGroupRepository hospitalGroupRepository,
            IHospitalRepository hospitalRepository,
            ITenantSubscriptionRepository subscriptionRepository,
            ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup> sortingExpressionProvider
        )
        {
            _hospitalGroupRepository = hospitalGroupRepository;
            _hospitalRepository = hospitalRepository;
            _subscriptionRepository = subscriptionRepository;
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

            List<HospitalGroupViewModel> items = paged.Items.Select(hg => HospitalGroupViewModel.FromHospitalGroup(hg)).ToList();
            await FillPlatformColumnsAsync(items, ct);

            return new PagedResult<HospitalGroupViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }

        /// <summary>One grouped count and one subscription lookup for the whole page, not one query per row.</summary>
        private async Task FillPlatformColumnsAsync(List<HospitalGroupViewModel> items, CancellationToken ct)
        {
            if (items.Count == 0) return;

            List<Guid> ids = items.Select(i => i.Id).ToList();

            Dictionary<Guid, int> hospitalCounts = await _hospitalRepository.CountByHospitalGroupAsync(ids, ct);

            Dictionary<Guid, string> plans = await _subscriptionRepository
                .GetAllNoTracking(s => ids.Contains(s.HospitalGroupId), includeProperties: "Plan")
                .Where(s => s.Plan != null)
                .ToDictionaryAsync(s => s.HospitalGroupId, s => s.Plan!.Name, ct);

            foreach (HospitalGroupViewModel item in items)
            {
                item.HospitalCount = hospitalCounts.GetValueOrDefault(item.Id);
                item.SubscriptionPlan = plans.GetValueOrDefault(item.Id);
            }
        }
    }
}
