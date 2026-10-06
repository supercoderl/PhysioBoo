using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Subscriptions;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Subscriptions.GetPlans
{
    public sealed class GetSubscriptionPlansQueryHandler : IRequestHandler<GetSubscriptionPlansQuery, List<SubscriptionPlanViewModel>>
    {
        private readonly ISubscriptionPlanRepository _planRepository;
        private readonly ITenantSubscriptionRepository _subscriptionRepository;

        public GetSubscriptionPlansQueryHandler(
            ISubscriptionPlanRepository planRepository,
            ITenantSubscriptionRepository subscriptionRepository
        )
        {
            _planRepository = planRepository;
            _subscriptionRepository = subscriptionRepository;
        }

        public async Task<List<SubscriptionPlanViewModel>> Handle(GetSubscriptionPlansQuery request, CancellationToken ct)
        {
            List<SubscriptionPlan> plans = await _planRepository
                .GetAllNoTracking(p => request.IncludeInactive || p.IsActive)
                .OrderBy(p => p.SortOrder)
                .ThenBy(p => p.MonthlyPrice)
                .ToListAsync(ct);

            Dictionary<Guid, int> subscribers = await _subscriptionRepository
                .GetAllNoTracking(s => s.Status != SubscriptionStatus.Cancelled)
                .GroupBy(s => s.PlanId)
                .Select(g => new { PlanId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PlanId, x => x.Count, ct);

            return plans.Select(p => SubscriptionPlanViewModel.FromEntity(p, subscribers.GetValueOrDefault(p.Id))).ToList();
        }
    }
}
