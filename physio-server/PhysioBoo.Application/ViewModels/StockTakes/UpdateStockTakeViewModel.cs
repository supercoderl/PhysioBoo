namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed record UpdateStockTakeViewModel(
        Guid DepartmentId,
        DateOnly ScheduledDate,
        Guid? AssignedTo,
        string? Notes
    );
}
