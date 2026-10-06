using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Theatre
{
    public class SurgeryAlert : TenantEntity
    {
        #region Core SurgeryAlert Table (11)
        public Guid? SurgeryCaseId { get; private set; }
        public Guid? PatientId { get; private set; }
        public SurgeryAlertType Type { get; private set; }
        public SurgeryAlertSeverity Severity { get; private set; }
        public string Description { get; private set; }
        public string SuggestedAction { get; private set; }
        public DateTime RaisedAt { get; private set; }
        public bool IsAcknowledged { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }
        public string? AcknowledgedByName { get; private set; }
        public string? AcknowledgeNote { get; private set; }

        public virtual SurgeryCase? SurgeryCase { get; private set; }
        public virtual Patient? Patient { get; private set; }
        #endregion

        #region Constructor (11)
        public SurgeryAlert(
            Guid id,
            Guid? surgeryCaseId,
            Guid? patientId,
            SurgeryAlertType type,
            SurgeryAlertSeverity severity,
            string description,
            string suggestedAction
        ) : base(id)
        {
            SurgeryCaseId = surgeryCaseId;
            PatientId = patientId;
            Type = type;
            Severity = severity;
            Description = description;
            SuggestedAction = suggestedAction;
            RaisedAt = TimeZoneHelper.GetLocalTimeNow();
            IsAcknowledged = false;
        }
        #endregion

        #region Setter Methods (11)
        public void SetSeverity(SurgeryAlertSeverity severity) { Severity = severity; }
        public void SetDescription(string description) { Description = description; }
        public void SetSuggestedAction(string suggestedAction) { SuggestedAction = suggestedAction; }
        public void SetIsAcknowledged(bool isAcknowledged) { IsAcknowledged = isAcknowledged; }
        public void SetAcknowledgedAt(DateTime? acknowledgedAt) { AcknowledgedAt = acknowledgedAt; }
        public void SetAcknowledgedByName(string? acknowledgedByName) { AcknowledgedByName = acknowledgedByName; }
        public void SetAcknowledgeNote(string? acknowledgeNote) { AcknowledgeNote = acknowledgeNote; }
        #endregion
    }
}
