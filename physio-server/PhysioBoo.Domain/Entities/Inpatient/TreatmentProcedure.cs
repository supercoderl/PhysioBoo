namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class TreatmentProcedure : TenantEntity
    {
        #region Core TreatmentProcedure Table (7)
        public Guid PatientId { get; private set; }
        public string Name { get; private set; }
        public TreatmentProcedureStatus Status { get; private set; }
        public string Department { get; private set; }
        public DateTime ScheduledAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public string? PerformerName { get; private set; }
        #endregion

        #region Constructor (7)
        public TreatmentProcedure(
            Guid id,
            Guid patientId,
            string name,
            TreatmentProcedureStatus status,
            string department,
            DateTime scheduledAt,
            DateTime? completedAt,
            string? performerName
        ) : base(id)
        {
            PatientId = patientId;
            Name = name;
            Status = status;
            Department = department;
            ScheduledAt = scheduledAt;
            CompletedAt = completedAt;
            PerformerName = performerName;
        }
        #endregion

        #region Setter Methods (7)
        public void SetName(string name) { Name = name; }
        public void SetStatus(TreatmentProcedureStatus status) { Status = status; }
        public void SetDepartment(string department) { Department = department; }
        public void SetScheduledAt(DateTime scheduledAt) { ScheduledAt = scheduledAt; }
        public void SetCompletedAt(DateTime? completedAt) { CompletedAt = completedAt; }
        public void SetPerformerName(string? performerName) { PerformerName = performerName; }
        #endregion
    }
}
