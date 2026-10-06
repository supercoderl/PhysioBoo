using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class ClinicalAlert : TenantEntity
    {
        #region Core ClinicalAlert Table (9)
        public Guid PatientId { get; private set; }
        public ClinicalAlertType Type { get; private set; }
        public ClinicalAlertSeverity Severity { get; private set; }
        public string Message { get; private set; }
        public DateTime RaisedAt { get; private set; }
        public bool IsAcknowledged { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }
        public string? AcknowledgedByName { get; private set; }
        public string? AcknowledgeNote { get; private set; }

        public virtual Patient? Patient { get; private set; }
        #endregion

        #region Constructor (9)
        public ClinicalAlert(
            Guid id,
            Guid patientId,
            ClinicalAlertType type,
            ClinicalAlertSeverity severity,
            string message
        ) : base(id)
        {
            PatientId = patientId;
            Type = type;
            Severity = severity;
            Message = message;
            RaisedAt = TimeZoneHelper.GetLocalTimeNow();
            IsAcknowledged = false;
        }
        #endregion

        #region Setter Methods (9)
        public void SetSeverity(ClinicalAlertSeverity severity) { Severity = severity; }
        public void SetMessage(string message) { Message = message; }
        public void SetIsAcknowledged(bool isAcknowledged) { IsAcknowledged = isAcknowledged; }
        public void SetAcknowledgedAt(DateTime? acknowledgedAt) { AcknowledgedAt = acknowledgedAt; }
        public void SetAcknowledgedByName(string? acknowledgedByName) { AcknowledgedByName = acknowledgedByName; }
        public void SetAcknowledgeNote(string? acknowledgeNote) { AcknowledgeNote = acknowledgeNote; }
        #endregion
    }
}
