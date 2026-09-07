namespace PhysioBoo.Application.ViewModels.Cashier
{
    public sealed record ApplyDiscountViewModel(decimal DiscountPercent);

    public sealed record ApplyInsuranceViewModel(Guid InsuranceCompanyId, string PolicyNo, decimal CoverageAmount);

    public sealed record PaymentSplitInput(string Method, decimal Amount);

    public sealed record ReceivePaymentViewModel(Guid InvoiceId, List<PaymentSplitInput> Splits, decimal AmountTendered);

    public sealed record RefundPaymentViewModel(Guid InvoiceId, Guid? PaymentId, decimal Amount, string Reason, string Method);

    public sealed record VoidInvoiceViewModel(string Reason);
}
