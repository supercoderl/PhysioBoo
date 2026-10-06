namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class NursingTask : TenantEntity
    {
        #region Core NursingTask Table (7)
        public Guid PatientId { get; private set; }
        public string Label { get; private set; }
        public DateTime DueAt { get; private set; }
        public NursingTaskStatus Status { get; private set; }
        public string? AssignedNurseName { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        #endregion

        #region Constructor (7)
        public NursingTask(
            Guid id,
            Guid patientId,
            string label,
            DateTime dueAt,
            string? assignedNurseName
        ) : base(id)
        {
            PatientId = patientId;
            Label = label;
            DueAt = dueAt;
            Status = NursingTaskStatus.Pending;
            AssignedNurseName = assignedNurseName;
            CompletedAt = null;
        }
        #endregion

        #region Setter Methods (7)
        public void SetLabel(string label) { Label = label; }
        public void SetDueAt(DateTime dueAt) { DueAt = dueAt; }
        public void SetStatus(NursingTaskStatus status) { Status = status; }
        public void SetAssignedNurseName(string? assignedNurseName) { AssignedNurseName = assignedNurseName; }
        public void SetCompletedAt(DateTime? completedAt) { CompletedAt = completedAt; }
        #endregion
    }
}
