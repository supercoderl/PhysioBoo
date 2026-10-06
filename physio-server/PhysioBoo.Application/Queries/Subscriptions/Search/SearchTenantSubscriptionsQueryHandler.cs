using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Subscriptions;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Subscriptions.Search
{
    public sealed class SearchTenantSubscriptionsQueryHandler : IRequestHandler<SearchTenantSubscriptionsQuery, PagedResult<TenantSubscriptionViewModel>>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly ITenantSubscriptionRepository _subscriptionRepository;
        private readonly ISubscriptionInvoiceRepository _invoiceRepository;

        public SearchTenantSubscriptionsQueryHandler(
            IHospitalGroupRepository hospitalGroupRepository,
            ITenantSubscriptionRepository subscriptionRepository,
            ISubscriptionInvoiceRepository invoiceRepository
        )
        {
            _hospitalGroupRepository = hospitalGroupRepository;
            _subscriptionRepository = subscriptionRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<PagedResult<TenantSubscriptionViewModel>> Handle(SearchTenantSubscriptionsQuery request, CancellationToken ct)
        {
            var tenants = await _hospitalGroupRepository
                .GetAllNoTracking()
                .Select(g => new { g.Id, g.Name, g.Email })
                .ToListAsync(ct);

            Dictionary<Guid, TenantSubscription> subscriptions = await _subscriptionRepository
                .GetAllNoTracking(includeProperties: "Plan")
                .ToDictionaryAsync(s => s.HospitalGroupId, ct);

            var openInvoices = await _invoiceRepository
                .GetAllNoTracking(i => i.Status == SubscriptionInvoiceStatus.Open)
                .GroupBy(i => i.HospitalGroupId)
                .Select(g => new { HospitalGroupId = g.Key, Count = g.Count(), Amount = g.Sum(i => i.Amount) })
                .ToDictionaryAsync(x => x.HospitalGroupId, ct);

            List<TenantSubscriptionViewModel> rows = tenants.Select(t =>
            {
                subscriptions.TryGetValue(t.Id, out TenantSubscription? s);
                var open = openInvoices.GetValueOrDefault(t.Id);
                TenantSubscriptionViewModel row = new TenantSubscriptionViewModel
                {
                    HospitalGroupId = t.Id,
                    TenantName = t.Name,
                    TenantEmail = t.Email,
                    OpenInvoiceCount = open?.Count ?? 0,
                    OutstandingAmount = open?.Amount ?? 0
                };
                SubscriptionMapping.Fill(row, s);
                return row;
            }).ToList();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim();
                rows = rows.Where(r =>
                    r.TenantName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                    (r.TenantEmail?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                rows = rows.Where(r => string.Equals(r.Status, request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 20 : Math.Min(request.PageSize, 100);

            List<TenantSubscriptionViewModel> page = rows
                .OrderBy(r => r.Status == nameof(SubscriptionStatus.PastDue) ? 0 : 1)
                .ThenBy(r => r.TenantName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagedResult<TenantSubscriptionViewModel>(rows.Count, page, pageNumber, pageSize);
        }
    }

    public static class SubscriptionMapping
    {
        /// <summary>
        /// Copies subscription fields onto a row; leaves the "None" defaults when there is no subscription.
        /// </summary>
        public static void Fill(TenantSubscriptionViewModel row, TenantSubscription? s)
        {
            if (s == null) return;

            row.SubscriptionId = s.Id;
            row.PlanId = s.PlanId;
            row.PlanName = s.Plan?.Name;
            row.MonthlyPrice = s.Plan?.MonthlyPrice ?? 0;
            row.Currency = s.Plan?.Currency ?? "USD";
            row.Status = s.Status.ToString();
            row.CurrentPeriodStart = s.CurrentPeriodStart;
            row.CurrentPeriodEnd = s.CurrentPeriodEnd;
            row.TrialEndsAt = s.TrialEndsAt;
        }
    }
}
