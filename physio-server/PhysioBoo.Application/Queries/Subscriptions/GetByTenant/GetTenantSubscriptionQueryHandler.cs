using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Subscriptions.Search;
using PhysioBoo.Application.ViewModels.Subscriptions;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Subscriptions.GetByTenant
{
    public sealed class GetTenantSubscriptionQueryHandler : IRequestHandler<GetTenantSubscriptionQuery, TenantSubscriptionDetailViewModel?>
    {
        private readonly IHospitalGroupRepository _hospitalGroupRepository;
        private readonly ITenantSubscriptionRepository _subscriptionRepository;
        private readonly IMediatorHandler _bus;

        public GetTenantSubscriptionQueryHandler(
            IHospitalGroupRepository hospitalGroupRepository,
            ITenantSubscriptionRepository subscriptionRepository,
            IMediatorHandler bus
        )
        {
            _hospitalGroupRepository = hospitalGroupRepository;
            _subscriptionRepository = subscriptionRepository;
            _bus = bus;
        }

        public async Task<TenantSubscriptionDetailViewModel?> Handle(GetTenantSubscriptionQuery request, CancellationToken ct)
        {
            var tenant = await _hospitalGroupRepository
                .GetAllNoTracking(g => g.Id == request.HospitalGroupId)
                .Select(g => new { g.Id, g.Name, g.Email })
                .FirstOrDefaultAsync(ct);

            if (tenant == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetTenantSubscriptionQuery),
                    $"Tenant with id {request.HospitalGroupId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            TenantSubscription? subscription = await _subscriptionRepository
                .GetAllNoTracking(s => s.HospitalGroupId == tenant.Id, includeProperties: "Plan,Invoices")
                .FirstOrDefaultAsync(ct);

            List<SubscriptionInvoice> invoices = subscription?.Invoices.OrderByDescending(i => i.IssuedAt).ToList() ?? new List<SubscriptionInvoice>();
            List<SubscriptionInvoice> open = invoices.Where(i => i.Status == SubscriptionInvoiceStatus.Open).ToList();

            TenantSubscriptionDetailViewModel detail = new TenantSubscriptionDetailViewModel
            {
                HospitalGroupId = tenant.Id,
                TenantName = tenant.Name,
                TenantEmail = tenant.Email,
                OpenInvoiceCount = open.Count,
                OutstandingAmount = open.Sum(i => i.Amount),
                StartedAt = subscription?.StartedAt,
                CancelledAt = subscription?.CancelledAt,
                BillingEmail = subscription?.BillingEmail ?? tenant.Email,
                Notes = subscription?.Notes,
                Invoices = invoices.Select(SubscriptionInvoiceViewModel.FromEntity).ToList()
            };
            SubscriptionMapping.Fill(detail, subscription);

            return detail;
        }
    }
}
