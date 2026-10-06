using PhysioBoo.Application.ViewModels.Subscriptions;

namespace PhysioBoo.Application.Queries.Subscriptions.GetPlans
{
    public sealed record GetSubscriptionPlansQuery(bool IncludeInactive) : IRequest<List<SubscriptionPlanViewModel>>;
}
