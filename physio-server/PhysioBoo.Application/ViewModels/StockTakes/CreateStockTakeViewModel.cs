namespace PhysioBoo.Application.ViewModels.StockTakes
{
    public sealed record CreateStockTakeViewModel(
        Guid Id,
        Guid WarehouseId, // HospitalId
        Guid DepartmentId,
        DateOnly ScheduledDate,
        Guid? AssignedTo,
        string? Notes
    );
}
