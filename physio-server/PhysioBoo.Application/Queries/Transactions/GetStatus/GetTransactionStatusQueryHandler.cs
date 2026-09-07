
using PhysioBoo.Application.Interfaces.Payment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Application.ViewModels.Transactions;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Transactions.GetStatus
{
    public sealed class GetTransactionStatusQueryHandler : IRequestHandler<GetTransactionStatusQuery, TransactionViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IEnumerable<IPaymentGateway> _gateways;

        public GetTransactionStatusQueryHandler(
            IMediatorHandler bus,
            ITransactionRepository transactionRepository,
            IEnumerable<IPaymentGateway> gateways
        )
        {
            _bus = bus;
            _transactionRepository = transactionRepository;
            _gateways = gateways;
        }

        public async Task<TransactionViewModel?> Handle(GetTransactionStatusQuery request, CancellationToken ct)
        {
            Transaction? transaction = await _transactionRepository.GetByIdAsync(request.Id, ct: ct);

            if (transaction is null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetTransactionStatusQuery),
                    $"Transaction with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            // Terminal transactions are settled — return the cached state, no need to call the gateway.
            if (transaction.IsTerminal)
            {
                return TransactionViewModel.FromTransaction(transaction);
            }

            IPaymentGateway? gateway = _gateways.FirstOrDefault(g =>
                g.ProviderName.Equals(transaction.GatewayProvider, StringComparison.OrdinalIgnoreCase));

            if (gateway is null)
            {
                return TransactionViewModel.FromTransaction(transaction);
            }

            GatewayStatusResult status = await gateway.QueryStatusAsync(transaction.MerchantReference, ct);

            // On query failure, fall back to the last known local status rather than surfacing an error.
            if (!status.IsSuccess)
            {
                return TransactionViewModel.FromTransaction(transaction);
            }

            try
            {
                transaction.EnsureCanTransitionTo(status.Status);
            }
            catch (InvalidOperationException)
            {
                return TransactionViewModel.FromTransaction(transaction);
            }

            transaction.SetStatus(status.Status);
            transaction.SetGatewayResultCode(status.ResultCode);
            transaction.SetGatewayResultMessage(status.ResultMessage);
            transaction.SetPaymentMethod(status.PaymentMethod ?? transaction.PaymentMethod);
            transaction.SetBankCode(status.BankCode ?? transaction.BankCode);

            await _transactionRepository.UpdateTrackedAsync(transaction, ct);

            return TransactionViewModel.FromTransaction(transaction);
        }
    }
}
