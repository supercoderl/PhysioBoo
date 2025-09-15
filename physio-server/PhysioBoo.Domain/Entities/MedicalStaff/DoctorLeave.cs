using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorLeave : Entity
    {
        #region Core Doctor Leave Table (16)
        public Guid DoctorId { get; private set; }
        public LeaveType LeaveType { get; private set; }
        public DateOnly StartDate { get; private set; }
        public DateOnly EndDate { get; private set; }
        public TimeOnly? StartTime { get; private set; }
        public TimeOnly? EndTime { get; private set; }
        public decimal TotalDays { get; private set; }
        public string? Reason { get; private set; }
        public LeaveStatus Status { get; private set; }
        public Guid? ApprovedBy { get; private set; }
        public DateTime? ApprovedAt { get; private set; }
        public Guid? SubstituteDoctorId { get; private set; }
        public string? EmergencyContact { get; private set; }
        public string? DocumentsUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Leaves")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("ApprovedBy")]
        [InverseProperty("ApprovedLeaves")]
        public virtual User? Approver { get; private set; }

        [ForeignKey("SubstituteDoctorId")]
        [InverseProperty("SubstitutedLeaves")]
        public virtual Doctor? SubstituteDoctor { get; private set; }
        #endregion

        #region Constructor (16)
        public DoctorLeave(
            Guid id,
            Guid doctorId,
            LeaveType leaveType,
            DateOnly startDate,
            DateOnly endDate,
            TimeOnly? startTime,
            TimeOnly? endTime,
            decimal totalDays,
            string? reason,
            Guid? approvedBy,
            DateTime? approvedAt,
            Guid? substituteDoctorId,
            string? emergencyContact,
            string? documentsUrl
        ) : base(id)
        {
            DoctorId = doctorId;
            LeaveType = leaveType;
            StartDate = startDate;
            EndDate = endDate;
            StartTime = startTime;
            EndTime = endTime;
            TotalDays = totalDays;
            Reason = reason;
            Status = LeaveStatus.Pending;
            ApprovedBy = approvedBy;
            ApprovedAt = approvedAt;
            SubstituteDoctorId = substituteDoctorId;
            EmergencyContact = emergencyContact;
            DocumentsUrl = documentsUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (16)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetLeaveType(LeaveType leaveType) { LeaveType = leaveType; }
        public void SetStartDate(DateOnly startDate) { StartDate = startDate; }
        public void SetEndDate(DateOnly endDate) { EndDate = endDate; }
        public void SetStartTime(TimeOnly? startTime) { StartTime = startTime; }
        public void SetEndTime(TimeOnly? endTime) { EndTime = endTime; }
        public void SetTotalDays(decimal totalDays) { TotalDays = totalDays; }
        public void SetReason(string? reason) { Reason = reason; }
        public void SetStatus(LeaveStatus status) { Status = status; }
        public void SetApprovedBy(Guid? approvedBy) { ApprovedBy = approvedBy; }
        public void SetApprovedAt(DateTime? approvedAt) { ApprovedAt = approvedAt; }
        public void SetSubstituteDoctorId(Guid? substituteDoctorId) { SubstituteDoctorId = substituteDoctorId; }
        public void SetEmergencyContact(string? emergencyContact) { EmergencyContact = emergencyContact; }
        public void SetDocumentsUrl(string? documentsUrl) { DocumentsUrl = documentsUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
