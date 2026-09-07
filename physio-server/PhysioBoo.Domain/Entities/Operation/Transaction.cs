

using System.Diagnostics.CodeAnalysis;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Transaction : TenantEntity
    {
        #region Core Transaction Table (15)
        /// <summary>Unique reference we generated and sent to the payment provider.</summary>
        public required string MerchantReference { get; set; }

        /// <summary>Order / invoice number that drove this payment.</summary>
        public required string InvoiceNo { get; set; }

        /// <summary>Optional FK to an internal order / booking entity.</summary>
        public Guid? RelatedEntityId { get; set; }

        /// <summary>Transaction ID assigned by the payment gateway (e.g. MegaPay trxId).</summary>
        public string? GatewayTransactionId { get; set; }

        /// <summary>Slug of the gateway that processed this transaction (e.g. "megapay").</summary>
        public required string GatewayProvider { get; set; }

        public long Amount { get; set; }
        public string Currency { get; set; } = "VND";

        public TransactionStatus Status { get; set; } = TransactionStatus.Created;

        public string? GatewayResultCode { get; set; }
        public string? GatewayResultMessage { get; set; }
        public string? PaymentMethod { get; set; }  // e.g. "IC", "DC", "EW"
        public string? BankCode { get; set; }
        public string? PaymentUrl { get; set; }
        public string? QrCode { get; set; }
        /// <summary>Raw QR payload text (EMV string), for gateways that don't provide a redirect URL.</summary>
        public string? QrContent { get; set; }
        public string? LinkExpTime { get; set; }
        #endregion

        #region Constructor (15)
        [SetsRequiredMembers]
        public Transaction(
            Guid id,
            string merchantReference,
            string invoiceNo,
            string gatewayProvider,
            Guid? relatedEntityId,
            string? gatewayTransactionId,
            long amount,
            string currency,
            TransactionStatus status
        ) : base(id)
        {
            MerchantReference = merchantReference;
            InvoiceNo = invoiceNo;
            GatewayProvider = gatewayProvider;
            RelatedEntityId = relatedEntityId;
            GatewayTransactionId = gatewayTransactionId;
            Amount = amount;
            Currency = currency;
            Status = status;
        }
        #endregion

        #region Setter Methods (15)
        public void SetMerchantReference(string merchantReference) { MerchantReference = merchantReference; }
        public void SetInvoiceNo(string invoiceNo) { InvoiceNo = invoiceNo; }
        public void SetRelatedEntityId(Guid? relatedEntityId) { RelatedEntityId = relatedEntityId; }
        public void SetGatewayTransactionId(string? gatewayTransactionId) { GatewayTransactionId = gatewayTransactionId; }
        public void SetAmount(long amount) { Amount = amount; }
        public void SetCurrency(string currency) { Currency = currency; }
        public void SetStatus(TransactionStatus status) { Status = status; }
        public void SetGatewayResultCode(string? gatewayResultCode) { GatewayResultCode = gatewayResultCode; }
        public void SetGatewayResultMessage(string? gatewayResultMessage) { GatewayResultMessage = gatewayResultMessage; }
        public void SetPaymentMethod(string? paymentMethod) { PaymentMethod = paymentMethod; }
        public void SetBankCode(string? bankCode) { BankCode = bankCode; }
        public void SetPaymentUrl(string? paymentUrl) { PaymentUrl = paymentUrl; }
        public void SetQrCode(string? qrCode) { QrCode = qrCode; }
        public void SetQrContent(string? qrContent) { QrContent = qrContent; }
        public void SetLinkExpireTime(string? linkExpireTime) { LinkExpTime = linkExpireTime; }

        [NotMapped]
        public bool IsTerminal =>
            Status is TransactionStatus.Succeeded
                or TransactionStatus.Failed
                or TransactionStatus.Cancelled
                or TransactionStatus.Refunded;

        public void EnsureCanTransitionTo(TransactionStatus next)
        {
            if (IsTerminal)
                throw new InvalidOperationException(
                    $"Transaction {Id} is in terminal state {Status} and cannot transition to {next}.");
        }
        #endregion
    }
}
