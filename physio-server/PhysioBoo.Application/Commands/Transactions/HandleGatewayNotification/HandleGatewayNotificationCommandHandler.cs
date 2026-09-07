
using PhysioBoo.Application.Interfaces.Payment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Transactions.HandleGatewayNotification
{
    public sealed class HandleGatewayNotificationCommandHandler : CommandHandlerBase, IRequestHandler<HandleGatewayNotificationCommand>
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IEnumerable<IPaymentGateway> _gateways;

        public HandleGatewayNotificationCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITransactionRepository transactionRepository,
            IEnumerable<IPaymentGateway> gateways
        ) : base(bus, unitOfWork, notifications)
        {
            _transactionRepository = transactionRepository;
            _gateways = gateways;
        }

        public async Task Handle(HandleGatewayNotificationCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            IPaymentGateway? gateway = _gateways.FirstOrDefault(g =>
                g.ProviderName.Equals(request.GatewayProvider, StringComparison.OrdinalIgnoreCase));

            if (gateway is null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Gateway '{request.GatewayProvider}' not found.",
                    DomainErrorCodes.Transaction.GatewayNotFound
                ));

                return;
            }

            GatewayStatusResult status = await gateway.HandleNotificationAsync(request.Context, ct);

            // The gateway already raised a DomainNotification with the specific failure reason.
            if (!status.IsSuccess) return;

            if (string.IsNullOrEmpty(status.GatewayTransactionId))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Gateway notification missing transaction reference.",
                    DomainErrorCodes.Transaction.MissingReference
                ));

                return;
            }

            Transaction? transaction = await _transactionRepository.GetByMerchantReferenceAsync(status.GatewayTransactionId, ct);

            if (transaction is null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Transaction not found for reference '{status.GatewayTransactionId}'.",
                    DomainErrorCodes.Transaction.NotFound
                ));

                return;
            }

            if (transaction.IsTerminal)
            {
                // Already settled — acknowledge without reprocessing (gateway retries are expected).
                request.Handled = true;
                return;
            }

            try
            {
                transaction.EnsureCanTransitionTo(status.Status);
            }
            catch (InvalidOperationException)
            {
                // Stale/out-of-order notification — acknowledge without applying it.
                request.Handled = true;
                return;
            }

            transaction.SetStatus(status.Status);
            transaction.SetGatewayResultCode(status.ResultCode);
            transaction.SetGatewayResultMessage(status.ResultMessage);
            transaction.SetPaymentMethod(status.PaymentMethod ?? transaction.PaymentMethod);
            transaction.SetBankCode(status.BankCode ?? transaction.BankCode);

            await _transactionRepository.UpdateTrackedAsync(transaction, ct);

            request.Handled = true;
        }
    }
}
