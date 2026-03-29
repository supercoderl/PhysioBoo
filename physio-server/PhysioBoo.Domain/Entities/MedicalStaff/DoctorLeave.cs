using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorLeave : TenantEntity
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

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual User? Approver { get; private set; }
        public virtual Doctor? SubstituteDoctor { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
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
        #endregion
    }
}
