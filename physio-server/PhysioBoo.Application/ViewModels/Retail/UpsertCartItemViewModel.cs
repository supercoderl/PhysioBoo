namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed record UpsertCartItemViewModel(
        int Quantity,
        decimal DiscountPercent
    );
}
