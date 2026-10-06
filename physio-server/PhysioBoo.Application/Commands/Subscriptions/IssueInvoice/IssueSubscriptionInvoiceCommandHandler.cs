using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Subscriptions.IssueInvoice
{
    public sealed class IssueSubscriptionInvoiceCommandHandler : CommandHandlerBase, IRequestHandler<IssueSubscriptionInvoiceCommand>
    {
        private const int PaymentTermDays = 7;

        private readonly ITenantSubscriptionRepository _subscriptionRepository;
        private readonly ISubscriptionInvoiceRepository _invoiceRepository;
        private readonly IUser _user;

        public IssueSubscriptionInvoiceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITenantSubscriptionRepository subscriptionRepository,
            ISubscriptionInvoiceRepository invoiceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _subscriptionRepository = subscriptionRepository;
            _invoiceRepository = invoiceRepository;
            _user = user;
        }

        public async Task Handle(IssueSubscriptionInvoiceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            TenantSubscription? subscription = await _subscriptionRepository
                .GetAll(s => s.HospitalGroupId == request.HospitalGroupId, includeProperties: "Plan")
                .FirstOrDefaultAsync(ct);

            if (subscription == null || subscription.Plan == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "This tenant has no subscription to bill. Assign a plan first.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (subscription.Status is SubscriptionStatus.Trial or SubscriptionStatus.Cancelled)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"A {subscription.Status.ToString().ToLowerInvariant()} subscription isn't billed. Activate it first.", DomainErrorCodes.Subscription.InvalidState));
                return;
            }

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            subscription.RollPeriodTo(now);

            bool alreadyBilled = await _invoiceRepository
                .GetAllNoTracking(i => i.SubscriptionId == subscription.Id
                    && i.PeriodStart == subscription.CurrentPeriodStart
                    && i.Status != SubscriptionInvoiceStatus.Void)
                .AnyAsync(ct);

            if (alreadyBilled)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "An invoice for the current period already exists.", DomainErrorCodes.Subscription.DuplicateInvoice));
                return;
            }

            SubscriptionInvoice invoice = new SubscriptionInvoice(
                Guid.NewGuid(),
                subscription.Id,
                subscription.HospitalGroupId,
                $"SUB-{now:yyyyMM}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
                subscription.Plan.Name,
                subscription.CurrentPeriodStart,
                subscription.CurrentPeriodEnd,
                subscription.Plan.MonthlyPrice,
                subscription.Plan.Currency,
                now,
                now.AddDays(PaymentTermDays)
            );
            invoice.SetCreatedBy(_user.GetUserId());
            _invoiceRepository.Add(invoice);

            subscription.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
