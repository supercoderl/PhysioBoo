using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Payments.CreatePayment
{
    public sealed class CreatePaymentCommandHandler : CommandHandlerBase, IRequestHandler<CreatePaymentCommand>
    {
        private readonly IPaymentRepository _paymentRepository;

        public CreatePaymentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPaymentRepository paymentRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _paymentRepository.InsertAsync<Payment, Guid>(new Payment(
                request.NewPayment.Id,
                request.NewPayment.PaymentNumber,
                request.NewPayment.BillId,
                request.NewPayment.PatientId,
                request.NewPayment.Amount,
                request.NewPayment.Method,
                request.NewPayment.TransactionId,
                request.NewPayment.ReferenceNumber,
                request.NewPayment.BankName,
                request.NewPayment.CashLastFour,
                request.NewPayment.GatewayResponse,
                request.NewPayment.FailureReason,
                request.NewPayment.ProcessedBy,
                request.NewPayment.ReceiptUrl,
                request.NewPayment.RefundDate,
                request.NewPayment.RefundReason,
                request.NewPayment.Notes
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
