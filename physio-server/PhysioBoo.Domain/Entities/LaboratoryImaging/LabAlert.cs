namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    /// <summary>
    /// A laboratory alert raised by the workflow (panic/critical result, rejected sample).
    /// Patient name and order number are copied at raise time so the alert list needs no joins.
    /// </summary>
    public class LabAlert : TenantEntity
    {
        #region Core LabAlert Table (12)
        public LabAlertType Type { get; private set; }
        public LabAlertSeverity Severity { get; private set; }
        public string Description { get; private set; }
        public string SuggestedAction { get; private set; }
        public Guid? LabOrderId { get; private set; }
        public Guid? LabOrderItemId { get; private set; }
        public string? PatientName { get; private set; }
        public string? OrderNumber { get; private set; }
        public DateTime RaisedAt { get; private set; }
        public bool Acknowledged { get; private set; }
        public Guid? AcknowledgedBy { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }
        #endregion

        #region Constructor (9)
        public LabAlert(
            Guid id,
            LabAlertType type,
            LabAlertSeverity severity,
            string description,
            string suggestedAction,
            Guid? labOrderId,
            Guid? labOrderItemId,
            string? patientName,
            string? orderNumber,
            DateTime raisedAt
        ) : base(id)
        {
            Type = type;
            Severity = severity;
            Description = description;
            SuggestedAction = suggestedAction;
            LabOrderId = labOrderId;
            LabOrderItemId = labOrderItemId;
            PatientName = patientName;
            OrderNumber = orderNumber;
            RaisedAt = raisedAt;
            Acknowledged = false;
        }
        #endregion

        #region Workflow
        public void Acknowledge(Guid userId, DateTime at)
        {
            Acknowledged = true;
            AcknowledgedBy = userId;
            AcknowledgedAt = at;
        }
        #endregion
    }
}
