namespace PhysioBoo.Application.ViewModels.Departments
{
    public sealed record UpdateDepartmentViewModel
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
        string? EquipmentList,
        int BedCount,
        bool IsEmergency,
        bool IsCriticalCare,
        bool IsOutPatient,
        bool IsInPatient,
        bool IsActive
    );
}
