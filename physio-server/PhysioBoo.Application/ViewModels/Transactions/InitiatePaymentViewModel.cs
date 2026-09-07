namespace PhysioBoo.Application.ViewModels.Transactions
{
    public sealed record InitiatePaymentViewModel
    (
        string GatewayProvider,
        string InvoiceNo,
        long Amount,
        string Currency,
        string GoodsName,
        string? Description,
        string? PaymentMethod,
        string? BankCode,
        string? BuyerFirstName,
        string? BuyerLastName,
        string? BuyerEmail,
        string? BuyerPhone,
        string? ExpiresAt,
        Guid? RelatedEntityId
    );
}
