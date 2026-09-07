
using PhysioBoo.Application.Extensions;
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Cashier.ReceivePayment
{
    public sealed class ReceivePaymentCommandHandler : CommandHandlerBase, IRequestHandler<ReceivePaymentCommand>
    {
        private readonly IBillRepository _billRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IUser _user;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;

        public ReceivePaymentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillRepository billRepository,
            IPaymentRepository paymentRepository,
            IUser user,
            ISys_SequenceTrackerRepository sequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billRepository = billRepository;
            _paymentRepository = paymentRepository;
            _user = user;
            _sequenceTrackerRepository = sequenceTrackerRepository;
        }

        public async Task Handle(ReceivePaymentCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Bill? bill = await _billRepository.GetByIdAsync(request.Payment.InvoiceId, includeProperties: "BillItems,Payments", ct: ct);

            if (bill == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Invoice {request.Payment.InvoiceId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            foreach (PaymentSplitInput split in request.Payment.Splits)
            {
                string paymentNumber = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Payment), ct);

                Payment payment = new Payment(
                    Guid.NewGuid(),
                    paymentNumber,
                    bill.Id,
                    bill.PatientId,
                    split.Amount,
                    Enum.Parse<PaymentMethod>(split.Method),
                    transactionId: null,
                    referenceNumber: null,
                    bankName: null,
                    cashLastFour: null,
                    gatewayResponse: null,
                    failureReason: null,
                    processedBy: _user.GetUserId(),
                    receiptUrl: null,
                    refundDate: null,
                    refundReason: null,
                    notes: null
                );

                payment.SetStatus(PaymentStatus.Paid);
                payment.SetTenantId(_user.GetTenantId());
                payment.SetCreatedBy(_user.GetUserId());

                await _paymentRepository.InsertAsync<Payment, Guid>(payment);
                bill.Payments.Add(payment);
            }

            bill.RecalculateAndApply();
            await _billRepository.UpdateTrackedAsync(bill, ct);
        }
    }
}
