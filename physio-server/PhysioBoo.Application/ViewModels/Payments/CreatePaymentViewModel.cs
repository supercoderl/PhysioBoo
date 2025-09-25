using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Payments
{
    public sealed record CreatePaymentViewModel
    (
        Guid Id,
        string PaymentNumber,
        Guid BillId,
        Guid PatientId,
        decimal Amount,
        PaymentMethod Method,
        string? TransactionId,
        string? ReferenceNumber,
        string? BankName,
        string? CashLastFour,
        string? GatewayResponse,
        string? FailureReason,
        Guid? ProcessedBy,
        string? ReceiptUrl,
        DateTime? RefundDate,
        string? RefundReason,
        string? Notes
    );
}
