namespace PhysioBoo.Application.ViewModels.Departments
{
    public sealed record CreateDepartmentViewModel
    (
        Guid Id,
        Guid HospitalId,
        string Name,
        string? DepartmentCode,
        string? Description,
        Guid? HeadOfDepartment,
        int? FloorNumber,
        string? Wing,
        string? Phone,
        string? Email,
        decimal? BudgetAllocated,
        string? OperationHours,
        string? EquipmentList
    );
}
