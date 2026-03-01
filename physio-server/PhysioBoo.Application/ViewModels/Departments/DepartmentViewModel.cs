using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.ViewModels.Departments
{
    public sealed class DepartmentViewModel
    {
        public Guid Id { get; set; }
        public Guid HospitalId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; }
        public string? Description { get; set; }
        public Guid? HeadOfDepartment { get; set; }
        public int? FloorNumber { get; set; }
        public string? Wing { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public decimal? BudgetAllocated { get; set; }
        public int BedCount { get; set; }
        public bool IsEmergency { get; set; }
        public bool IsCriticalCare { get; set; }
        public bool IsOutPatient { get; set; }
        public bool IsInPatient { get; set; }
        public string? OperationHours { get; set; }
        public string? EquipmentList { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static DepartmentViewModel FromDepartment(Department department)
        {
            return new DepartmentViewModel
            {
                Id = department.Id,
                HospitalId = department.HospitalId,
                Name = department.Name,
                DepartmentCode = department.DepartmentCode,
                Description = department.Description,
                HeadOfDepartment = department.HeadOfDepartment,
                FloorNumber = department.FloorNumber,
                Wing = department.Wing,
                Phone = department.Phone,
                Email = department.Email,
                BudgetAllocated = department.BudgetAllocated,
                BedCount = department.BedCount,
                IsEmergency = department.IsEmergency,
                IsCriticalCare = department.IsCriticalCare,
                IsOutPatient = department.IsOutPatient,
                IsInPatient = department.IsInPatient,
                OperationHours = department.OperationHours,
                EquipmentList = department.EquipmentList,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt
            };
        }
    }
}
