namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed record CheckoutPaymentSplitInput(
        string Method, // Cash | Card | QR | Insurance | Mixed
        decimal Amount
    );

    // TransactionId is client-generated, same convention as every other Create*ViewModel in this
    // codebase (e.g. CreateMedicineInventoryViewModel.Id) — the checkout API contract itself doesn't
    // document this field, but a command must own the id it creates since commands return no value.
    public sealed record CheckoutCartViewModel(
        Guid TransactionId,
        Guid HospitalId,
        List<CheckoutPaymentSplitInput> PaymentSplits,
        decimal AmountTendered
    );
}
