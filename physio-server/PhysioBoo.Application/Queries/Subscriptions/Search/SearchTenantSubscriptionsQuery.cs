using PhysioBoo.Application.ViewModels.Subscriptions;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Subscriptions.Search
{
    /// <summary>
    /// Every tenant (hospital group) with its subscription, including tenants that have none yet.
    /// </summary>
    public sealed record SearchTenantSubscriptionsQuery(string? Search, string? Status, int PageNumber, int PageSize) : IRequest<PagedResult<TenantSubscriptionViewModel>>;
}
