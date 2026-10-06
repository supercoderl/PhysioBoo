using PhysioBoo.Application.ViewModels.Subscriptions;

namespace PhysioBoo.Application.Queries.Subscriptions.GetByTenant
{
    public sealed record GetTenantSubscriptionQuery(Guid HospitalGroupId) : IRequest<TenantSubscriptionDetailViewModel?>;
}
