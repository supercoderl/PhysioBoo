using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Platform;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Subscriptions.SettleInvoice
{
    public sealed class SettleSubscriptionInvoiceCommandHandler : CommandHandlerBase, IRequestHandler<SettleSubscriptionInvoiceCommand>
    {
        private readonly ISubscriptionInvoiceRepository _invoiceRepository;
        private readonly IUser _user;

        public SettleSubscriptionInvoiceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISubscriptionInvoiceRepository invoiceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _invoiceRepository = invoiceRepository;
            _user = user;
        }

        public async Task Handle(SettleSubscriptionInvoiceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            SubscriptionInvoice? invoice = await _invoiceRepository
                .GetAll(i => i.Id == request.InvoiceId, includeProperties: "Subscription")
                .FirstOrDefaultAsync(ct);

            if (invoice == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice with id {request.InvoiceId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (invoice.Status != SubscriptionInvoiceStatus.Open)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {invoice.InvoiceNumber} is already {invoice.Status.ToString().ToLowerInvariant()}.", DomainErrorCodes.Subscription.InvalidState));
                return;
            }

            if (request.Settlement == InvoiceSettlement.Pay)
            {
                invoice.MarkPaid(TimeZoneHelper.GetLocalTimeNow(), string.IsNullOrWhiteSpace(request.PaymentReference) ? null : request.PaymentReference.Trim());

                // Paying the overdue bill brings the subscription back to good standing.
                if (invoice.Subscription?.Status == SubscriptionStatus.PastDue)
                {
                    invoice.Subscription.Activate(TimeZoneHelper.GetLocalTimeNow());
                    invoice.Subscription.SetUpdatedBy(_user.GetUserId());
                }
            }
            else
            {
                invoice.Void();
            }

            invoice.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
