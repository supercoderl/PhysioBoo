using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class HospitalStaff : Entity
    {
        #region Core HospitalStaff Table (25)
        public string EmployeeId { get; private set; }
        public Guid HospitalId { get; private set; }
        public Guid DepartmentId { get; private set; }
        public StaffType StaffType { get; private set; }
        public string? Position { get; private set; }
        public EmploymentType EmploymentType { get; private set; }
        public decimal? Salary { get; private set; }
        public decimal? HourlyRate { get; private set; }
        public DateOnly JoiningDate { get; private set; }
        public DateOnly? ProbationEndDate { get; private set; }
        public DateOnly? TerminationDate { get; private set; }
        public EmploymentStatus EmploymentStatus { get; private set; }
        public string? ShiftPattern { get; private set; }
        public Guid? ReportingManger { get; private set; }
        public string? EmergencyContactName { get; private set; }
        public string? EmergencyContactPhone { get; private set; }
        public string? BloodGroup { get; private set; }
        public DateOnly? MedicalFitnessExpiry { get; private set; }
        public bool PoliceVerificationStatus { get; private set; }
        public string? BankAccountDetails { get; private set; } // JSONB
        public string? PanNumber { get; private set; }
        public string? EsiNumber { get; private set; }
        public string? PfNumber { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("HospitalStaffs")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("DepartmentId")]
        [InverseProperty("HospitalStaffs")]
        public virtual Department? Department { get; private set; }

        [ForeignKey("ReportingManger")]
        [InverseProperty("HospitalStaffs")]
        public virtual User? Manager { get; private set; }
        #endregion

        #region Constructor (25)
        public HospitalStaff(
            Guid id,
            string employeeId,
            Guid hospitalId,
            Guid departmentId,
            StaffType staffType,
            string? position,
            EmploymentType employmentType,
            decimal? salary,
            decimal? hourlyRate,
            DateOnly? probationEndDate,
            DateOnly? terminationDate,
            string? shiftPattern,
            Guid? reportingManger,
            string? emergencyContactName,
            string? emergencyContactPhone,
            string? bloodGroup,
            DateOnly? medicalFitnessExpiry,
            string? bankAccountDetails,
            string? panNumber,
            string? esiNumber,
            string? pfNumber
        ) : base(id)
        {
            EmployeeId = employeeId;
            HospitalId = hospitalId;
            DepartmentId = departmentId;
            StaffType = staffType;
            Position = position;
            EmploymentType = employmentType;
            Salary = salary;
            HourlyRate = hourlyRate;
            JoiningDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            ProbationEndDate = probationEndDate;
            TerminationDate = terminationDate;
            EmploymentStatus = EmploymentStatus.Active;
            ShiftPattern = shiftPattern;
            ReportingManger = reportingManger;
            EmergencyContactName = emergencyContactName;
            EmergencyContactPhone = emergencyContactPhone;
            BloodGroup = bloodGroup;
            MedicalFitnessExpiry = medicalFitnessExpiry;
            PoliceVerificationStatus = false;
            BankAccountDetails = bankAccountDetails;
            PanNumber = panNumber;
            EsiNumber = esiNumber;
            PfNumber = pfNumber;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (25)
        public void SetEmployeeId(string employeeId) { EmployeeId = employeeId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetDepartmentId(Guid departmentId) { DepartmentId = departmentId; }
        public void SetStaffType(StaffType staffType) { StaffType = staffType; }
        public void SetPosition(string? position) { Position = position; }
        public void SetEmploymentType(EmploymentType employmentType) { EmploymentType = employmentType; }
        public void SetSalary(decimal? salary) { Salary = salary; }
        public void SetHourlyRate(decimal? hourlyRate) { HourlyRate = hourlyRate; }
        public void SetJoiningDate(DateOnly joiningDate) { JoiningDate = joiningDate; }
        public void SetProbationEndDate(DateOnly? probationEndDate) { ProbationEndDate = probationEndDate; }
        public void SetTerminationDate(DateOnly? terminationDate) { TerminationDate = terminationDate; }
        public void SetEmploymentStatus(EmploymentStatus employmentStatus) { EmploymentStatus = employmentStatus; }
        public void SetShiftPattern(string? shiftPattern) { ShiftPattern = shiftPattern; }
        public void SetReportingManger(Guid? reportingManger) { ReportingManger = reportingManger; }
        public void SetEmergencyContactName(string? emergencyContactName) { EmergencyContactName = emergencyContactName; }
        public void SetEmergencyContactPhone(string? emergencyContactPhone) { EmergencyContactPhone = emergencyContactPhone; }
        public void SetBloodGroup(string? bloodGroup) { BloodGroup = bloodGroup; }
        public void SetMedicalFitnessExpiry(DateOnly? medicalFitnessExpiry) { MedicalFitnessExpiry = medicalFitnessExpiry; }
        public void SetPoliceVerificationStatus(bool policeVerificationStatus) { PoliceVerificationStatus = policeVerificationStatus; }
        public void SetBankAccountDetails(string? bankAccountDetails) { BankAccountDetails = bankAccountDetails; }
        public void SetPanNumber(string? panNumber) { PanNumber = panNumber; }
        public void SetEsiNumber(string? esiNumber) { EsiNumber = esiNumber; }
        public void SetPfNumber(string? pfNumber) { PfNumber = pfNumber; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
