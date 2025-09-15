using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorWorkExperience : Entity
    {
        #region Core Doctor Work Experience Table (18)
        public Guid DoctorId { get; private set; }
        public string PositionTitle { get; private set; }
        public EmployeeType EmploymentType { get; private set; }
        public string OrganizationName { get; private set; }
        public string? OrganizationType { get; private set; }
        public string? Department { get; private set; }
        public string? Location { get; private set; }
        public string? Country { get; private set; }
        public DateOnly StartDate { get; private set; }
        public DateOnly? EndDate { get; private set; }
        public bool IsCurrent { get; private set; }
        public string? Responsibilities { get; private set; }
        public string? Archievements { get; private set; }
        public string? SalaryRange { get; private set; }
        public string? ReasonForLeaving { get; private set; }
        public string? SupervisorName { get; private set; }
        public string? SupervisorContact { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("WorkExperiences")]
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor (18)
        public DoctorWorkExperience(
            Guid id,
            Guid doctorId,
            string positionTitle,
            EmployeeType employmentType,
            string organizationName,
            string? organizationType,
            string? department,
            string? location,
            string? country,
            DateOnly startDate,
            DateOnly? endDate,
            string? responsibilities,
            string? archievements,
            string? salaryRange,
            string? reasonForLeaving,
            string? supervisorName,
            string? supervisorContact
        ) : base(id)
        {
            DoctorId = doctorId;
            PositionTitle = positionTitle;
            EmploymentType = employmentType;
            OrganizationName = organizationName;
            OrganizationType = organizationType;
            Department = department;
            Location = location;
            Country = country;
            StartDate = startDate;
            EndDate = endDate;
            IsCurrent = !endDate.HasValue;
            Responsibilities = responsibilities;
            Archievements = archievements;
            SalaryRange = salaryRange;
            ReasonForLeaving = reasonForLeaving;
            SupervisorName = supervisorName;
            SupervisorContact = supervisorContact;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (21)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetPositionTitle(string positionTitle) { PositionTitle = positionTitle; }
        public void SetEmploymentType(EmployeeType employmentType) { EmploymentType = employmentType; }
        public void SetOrganizationName(string organizationName) { OrganizationName = organizationName; }
        public void SetOrganizationType(string? organizationType) { OrganizationType = organizationType; }
        public void SetDepartment(string? department) { Department = department; }
        public void SetLocation(string? location) { Location = location; }
        public void SetCountry(string? country) { Country = country; }
        public void SetStartDate(DateOnly startDate) { StartDate = startDate; }
        public void SetEndDate(DateOnly? endDate)
        {
            EndDate = endDate;
            IsCurrent = !endDate.HasValue;
        }
        public void SetResponsibilities(string? responsibilities) { Responsibilities = responsibilities; }
        public void SetArchievements(string? archievements) { Archievements = archievements; }
        public void SetSalaryRange(string? salaryRange) { SalaryRange = salaryRange; }
        public void SetReasonForLeaving(string? reasonForLeaving) { ReasonForLeaving = reasonForLeaving; }
        public void SetSupervisorName(string? supervisorName) { SupervisorName = supervisorName; }
        public void SetSupervisorContact(string? supervisorContact) { SupervisorContact = supervisorContact; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
