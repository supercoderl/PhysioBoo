
using PhysioBoo.Application.Interfaces.Payment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Application.ViewModels.Transactions;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.Transactions.InitiatePayment
{
    public sealed class InitiatePaymentCommandHandler : CommandHandlerBase, IRequestHandler<InitiatePaymentCommand>
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IEnumerable<IPaymentGateway> _gateways;
        private readonly IUser _user;

        public InitiatePaymentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITransactionRepository transactionRepository,
            IEnumerable<IPaymentGateway> gateways,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _transactionRepository = transactionRepository;
            _gateways = gateways;
            _user = user;
        }

        public async Task Handle(InitiatePaymentCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            InitiatePaymentViewModel newPayment = request.NewPayment;

            IPaymentGateway? gateway = _gateways.FirstOrDefault(g =>
                g.ProviderName.Equals(newPayment.GatewayProvider, StringComparison.OrdinalIgnoreCase));

            if (gateway is null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Payment gateway '{newPayment.GatewayProvider}' is not registered.",
                    DomainErrorCodes.Transaction.GatewayNotFound
                ));

                return;
            }

            Transaction? existing = await _transactionRepository.GetByInvoiceNoAsync(newPayment.InvoiceNo, ct);

            if (existing is not null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Invoice '{newPayment.InvoiceNo}' already has a payment transaction.",
                    DomainErrorCodes.Transaction.DuplicateInvoice
                ));

                return;
            }

            string merchantReference = BuildMerchantReference(newPayment.GatewayProvider);

            Transaction transaction = new Transaction(
                Guid.NewGuid(),
                merchantReference,
                newPayment.InvoiceNo,
                gateway.ProviderName,
                newPayment.RelatedEntityId,
                gatewayTransactionId: null,
                newPayment.Amount,
                newPayment.Currency,
                TransactionStatus.Created
            );

            transaction.SetTenantId(_user.GetTenantId());
            transaction.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> insertResult = await _transactionRepository.InsertAsync<Transaction, Guid>(transaction);

            if (!insertResult.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {insertResult.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            GatewayCreateViewModel gatewayRequest = new GatewayCreateViewModel
            {
                MerchantReference = merchantReference,
                InvoiceNo = newPayment.InvoiceNo,
                Amount = newPayment.Amount,
                Currency = newPayment.Currency,
                GoodsName = newPayment.GoodsName,
                Description = newPayment.Description,
                PaymentMethod = newPayment.PaymentMethod,
                BankCode = newPayment.BankCode,
                BuyerFirstName = newPayment.BuyerFirstName,
                BuyerLastName = newPayment.BuyerLastName,
                BuyerEmail = newPayment.BuyerEmail,
                BuyerPhone = newPayment.BuyerPhone,
                ExpiresAt = newPayment.ExpiresAt,
            };

            GatewayCreateResult gatewayResult = await gateway.CreateAsync(gatewayRequest, ct);

            if (!gatewayResult.IsSuccess)
            {
                // The gateway already raised a DomainNotification with the specific failure reason.
                transaction.SetStatus(TransactionStatus.Failed);
                transaction.SetGatewayResultCode(gatewayResult.ErrorCode);
                transaction.SetGatewayResultMessage(gatewayResult.Error);

                await _transactionRepository.UpdateTrackedAsync(transaction, ct);

                return;
            }

            transaction.SetStatus(TransactionStatus.Pending);
            transaction.SetGatewayTransactionId(gatewayResult.GatewayTransactionId);
            transaction.SetPaymentUrl(gatewayResult.PaymentUrl);
            transaction.SetQrCode(gatewayResult.QrCode);
            transaction.SetQrContent(gatewayResult.QrContent);
            transaction.SetLinkExpireTime(gatewayResult.ExpiresAt);

            await _transactionRepository.UpdateTrackedAsync(transaction, ct);

            request.Result = TransactionViewModel.FromTransaction(transaction);
        }

        private static string BuildMerchantReference(string providerName)
        {
            string timeStamp = TimeZoneHelper.GetLocalTimeNow().ToString("yyyyMMddHHmmssfff");
            string rand = Random.Shared.Next(1000, 9999).ToString();
            string raw = $"{providerName.ToUpperInvariant()}{timeStamp}{rand}";
            return raw.Length > 50 ? raw[..50] : raw;
        }
    }
}
