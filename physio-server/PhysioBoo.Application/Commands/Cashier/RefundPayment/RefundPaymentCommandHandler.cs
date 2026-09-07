
using PhysioBoo.Application.Extensions;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Cashier.RefundPayment
{
    // If PaymentId is omitted, refunds against the most recent completed payment for the invoice —
    // the frontend's current refundPayment(invoiceId, ...) signature doesn't pass a specific payment
    // id (see docs/cashier-redesign.md §12.8).
    public sealed class RefundPaymentCommandHandler : CommandHandlerBase, IRequestHandler<RefundPaymentCommand>
    {
        private readonly IBillRepository _billRepository;
        private readonly IPaymentRepository _paymentRepository;

        public RefundPaymentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository,
            IPaymentRepository paymentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task Handle(RefundPaymentCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Bill? bill = await _billRepository.GetByIdAsync(request.Refund.InvoiceId, includeProperties: "BillItems,Payments", ct: ct);

            if (bill == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {request.Refund.InvoiceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            Payment? payment = request.Refund.PaymentId != null
                ? bill.Payments.FirstOrDefault(p => p.Id == request.Refund.PaymentId.Value)
                : bill.Payments.Where(p => p.Status == PaymentStatus.Paid && p.RefundAmount == 0).OrderByDescending(p => p.PaymentDate).FirstOrDefault();

            if (payment == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "No eligible payment found to refund.", ErrorCodes.ObjectNotFound));
                return;
            }

            payment.SetRefundAmount(request.Refund.Amount);
            payment.SetRefundDate(TimeZoneHelper.GetLocalTimeNow());
            payment.SetRefundReason(request.Refund.Reason);
            await _paymentRepository.UpdateTrackedAsync(payment, ct);

            bill.RecalculateAndApply();
            await _billRepository.UpdateTrackedAsync(bill, ct);
        }
    }
}
