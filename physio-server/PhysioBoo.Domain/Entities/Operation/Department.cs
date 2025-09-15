using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class Department : Entity
    {
        #region Core Department Table (20)
        public Guid HospitalId { get; private set; }
        public string Name { get; private set; }
        public string? DepartmentCode { get; private set; }
        public string? Description { get; private set; }
        public Guid? HeadOfDepartment { get; private set; }
        public int? FloorNumber { get; private set; }
        public string? Wing { get; private set; }
        public string? Phone { get; private set; }
        public string? Email { get; private set; }
        public decimal? BudgetAllocated { get; private set; }
        public int BedCount { get; private set; }
        public bool IsEmergency { get; private set; }
        public bool IsCriticalCare { get; private set; }
        public bool IsOutPatient { get; private set; }
        public bool IsInPatient { get; private set; }
        public string? OperationHours { get; private set; }
        public string? EquipmentList { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("Departments")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("HeadOfDepartment")]
        [InverseProperty("HeadedDepartments")]
        public virtual User? HeadOfDeptUser { get; private set; }

        [InverseProperty("Department")]
        public virtual ICollection<Appointment> Appointments { get; private set; } = new List<Appointment>();

        [InverseProperty("Department")]
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();

        [InverseProperty("Department")]
        public virtual ICollection<DoctorSchedule> DoctorSchedules { get; private set; } = new List<DoctorSchedule>();

        [InverseProperty("Department")]
        public virtual ICollection<HospitalStaff> HospitalStaffs { get; private set; } = new List<HospitalStaff>();
        #endregion

        #region Constructor (20)
        public Department(
            Guid id,
            Guid hospitalId,
            string name,
            string? departmentCode,
            string? description,
            Guid? headOfDepartment,
            int? floorNumber,
            string? wing,
            string? phone,
            string? email,
            decimal? budgetAllocated,
            string? operationHours,
            string? equipmentList
        ) : base(id)
        {
            HospitalId = hospitalId;
            Name = name;
            DepartmentCode = departmentCode;
            Description = description;
            HeadOfDepartment = headOfDepartment;
            FloorNumber = floorNumber;
            Wing = wing;
            Phone = phone;
            Email = email;
            BudgetAllocated = budgetAllocated;
            BedCount = 0; // Default to 0, can be updated later
            IsEmergency = false; // Default to false, can be updated later
            IsCriticalCare = false; // Default to false, can be updated later
            IsOutPatient = true; // Default to true, can be updated later
            IsInPatient = false; // Default to false, can be updated later
            OperationHours = operationHours;
            EquipmentList = equipmentList;
            IsActive = true; // Default to active
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (20)
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetName(string name) { Name = name; }
        public void SetDepartmentCode(string? departmentCode) { DepartmentCode = departmentCode; }
        public void SetDescription(string? description) { Description = description; }
        public void SetHeadOfDepartment(Guid? headOfDepartment) { HeadOfDepartment = headOfDepartment; }
        public void SetFloorNumber(int? floorNumber) { FloorNumber = floorNumber; }
        public void SetWing(string? wing) { Wing = wing; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetBudgetAllocated(decimal? budgetAllocated) { BudgetAllocated = budgetAllocated; }
        public void SetBedCount(int bedCount) { BedCount = bedCount; }
        public void SetIsEmergency(bool isEmergency) { IsEmergency = isEmergency; }
        public void SetIsCriticalCare(bool isCriticalCare) { IsCriticalCare = isCriticalCare; }
        public void SetIsOutPatient(bool isOutPatient) { IsOutPatient = isOutPatient; }
        public void SetIsInPatient(bool isInPatient) { IsInPatient = isInPatient; }
        public void SetOperationHours(string? operationHours) { OperationHours = operationHours; }
        public void SetEquipmentList(string? equipmentList) { EquipmentList = equipmentList; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
