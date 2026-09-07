using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Transactions
{
    public sealed record TransactionViewModel
    (
        Guid Id,
        string MerchantReference,
        string InvoiceNo,
        long Amount,
        string Currency,
        TransactionStatus Status,
        string? PaymentUrl,
        string? QrCode,
        string? QrContent,
        string? LinkExpTime,
        string? GatewayResultCode,
        string? GatewayResultMessage
    )
    {
        public static TransactionViewModel FromTransaction(Domain.Entities.Operation.Transaction transaction) =>
            new(
                transaction.Id,
                transaction.MerchantReference,
                transaction.InvoiceNo,
                transaction.Amount,
                transaction.Currency,
                transaction.Status,
                transaction.PaymentUrl,
                transaction.QrCode,
                transaction.QrContent,
                transaction.LinkExpTime,
                transaction.GatewayResultCode,
                transaction.GatewayResultMessage
            );
    }
}
