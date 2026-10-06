using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Theatre
{
    // "Delayed" is not stored: it is a case that should have started by now (see the view model).
    public class SurgeryCase : TenantEntity
    {
        #region Core SurgeryCase Table (23)
        public string SurgeryNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public string Procedure { get; private set; }
        public string SurgeryType { get; private set; }
        public Guid? DepartmentId { get; private set; }
        public Guid OperatingRoomId { get; private set; }
        public DateTime ScheduledStart { get; private set; }
        public int EstimatedDurationMinutes { get; private set; }
        public SurgeryPriority Priority { get; private set; }
        public SurgeryStatus Status { get; private set; }
        public string Diagnosis { get; private set; }
        public ConsentStatus ConsentStatus { get; private set; }
        public string RiskAssessment { get; private set; }
        public string? Notes { get; private set; }
        public string? Complications { get; private set; }
        public int? BloodLossMl { get; private set; }
        public int? EstimatedRemainingMinutes { get; private set; }
        public string? PacuBay { get; private set; }
        public string? RecoveryStatus { get; private set; }
        public string? PostOpNotes { get; private set; }
        public string? FollowUpOrders { get; private set; }
        public string? CancelReason { get; private set; }
        public DateTime? CancelledAt { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual OperatingRoom? OperatingRoom { get; private set; }

        public virtual ICollection<SurgeryTeamMember> Team { get; private set; } = new List<SurgeryTeamMember>();
        public virtual ICollection<SurgeryEquipmentItem> Equipment { get; private set; } = new List<SurgeryEquipmentItem>();
        public virtual ICollection<SurgeryChecklistItem> Checklist { get; private set; } = new List<SurgeryChecklistItem>();
        public virtual ICollection<SurgeryTimelineEvent> Timeline { get; private set; } = new List<SurgeryTimelineEvent>();
        #endregion

        #region Constructor (23)
        public SurgeryCase(
            Guid id,
            string surgeryNumber,
            Guid patientId,
            string procedure,
            string surgeryType,
            Guid? departmentId,
            Guid operatingRoomId,
            DateTime scheduledStart,
            int estimatedDurationMinutes,
            SurgeryPriority priority,
            string diagnosis,
            ConsentStatus consentStatus,
            string riskAssessment
        ) : base(id)
        {
            SurgeryNumber = surgeryNumber;
            PatientId = patientId;
            Procedure = procedure;
            SurgeryType = surgeryType;
            DepartmentId = departmentId;
            OperatingRoomId = operatingRoomId;
            ScheduledStart = scheduledStart;
            EstimatedDurationMinutes = estimatedDurationMinutes;
            Priority = priority;
            Status = SurgeryStatus.Scheduled;
            Diagnosis = diagnosis;
            ConsentStatus = consentStatus;
            RiskAssessment = riskAssessment;
        }
        #endregion

        #region Setter Methods (23)
        public void SetProcedure(string procedure) { Procedure = procedure; }
        public void SetSurgeryType(string surgeryType) { SurgeryType = surgeryType; }
        public void SetDepartmentId(Guid? departmentId) { DepartmentId = departmentId; }
        public void SetOperatingRoomId(Guid operatingRoomId) { OperatingRoomId = operatingRoomId; }
        public void SetScheduledStart(DateTime scheduledStart) { ScheduledStart = scheduledStart; }
        public void SetEstimatedDurationMinutes(int estimatedDurationMinutes) { EstimatedDurationMinutes = estimatedDurationMinutes; }
        public void SetPriority(SurgeryPriority priority) { Priority = priority; }
        public void SetStatus(SurgeryStatus status) { Status = status; }
        public void SetDiagnosis(string diagnosis) { Diagnosis = diagnosis; }
        public void SetConsentStatus(ConsentStatus consentStatus) { ConsentStatus = consentStatus; }
        public void SetRiskAssessment(string riskAssessment) { RiskAssessment = riskAssessment; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetComplications(string? complications) { Complications = complications; }
        public void SetBloodLossMl(int? bloodLossMl) { BloodLossMl = bloodLossMl; }
        public void SetEstimatedRemainingMinutes(int? estimatedRemainingMinutes) { EstimatedRemainingMinutes = estimatedRemainingMinutes; }
        public void SetPacuBay(string? pacuBay) { PacuBay = pacuBay; }
        public void SetRecoveryStatus(string? recoveryStatus) { RecoveryStatus = recoveryStatus; }
        public void SetPostOpNotes(string? postOpNotes) { PostOpNotes = postOpNotes; }
        public void SetFollowUpOrders(string? followUpOrders) { FollowUpOrders = followUpOrders; }
        public void SetCancelReason(string? cancelReason) { CancelReason = cancelReason; }
        public void SetCancelledAt(DateTime? cancelledAt) { CancelledAt = cancelledAt; }
        #endregion
    }
}
