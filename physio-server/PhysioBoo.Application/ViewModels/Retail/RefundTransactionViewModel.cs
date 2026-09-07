namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed record RefundTransactionViewModel(
        string Reason,
        List<Guid>? LineItemIds
    );
}
