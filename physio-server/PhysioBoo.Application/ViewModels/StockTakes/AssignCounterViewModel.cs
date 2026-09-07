namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed record AssignCounterViewModel(
        Guid AssignedTo,
        DateOnly? DueDate
    );
}
