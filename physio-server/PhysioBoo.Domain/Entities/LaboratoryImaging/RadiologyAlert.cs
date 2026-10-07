namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    /// <summary>
    /// A radiology alert (for example a critical finding on a verified report).
    /// Patient name and order number are copied at raise time so the alert list needs no joins.
    /// </summary>
    public class RadiologyAlert : TenantEntity
    {
        #region Core RadiologyAlert Table (11)
        public RadiologyAlertType Type { get; private set; }
        public RadiologyAlertSeverity Severity { get; private set; }
        public string Description { get; private set; }
        public Guid? ImagingOrderId { get; private set; }
        public string? PatientName { get; private set; }
        public string? OrderNumber { get; private set; }
        public DateTime RaisedAt { get; private set; }
        public bool Notified { get; private set; }
        public bool Acknowledged { get; private set; }
        public Guid? AcknowledgedBy { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }
        #endregion

        #region Constructor (7)
        public RadiologyAlert(
            Guid id,
            RadiologyAlertType type,
            RadiologyAlertSeverity severity,
            string description,
            Guid? imagingOrderId,
            string? patientName,
            string? orderNumber,
            DateTime raisedAt
        ) : base(id)
        {
            Type = type;
            Severity = severity;
            Description = description;
            ImagingOrderId = imagingOrderId;
            PatientName = patientName;
            OrderNumber = orderNumber;
            RaisedAt = raisedAt;
            Notified = false;
            Acknowledged = false;
        }
        #endregion

        #region Workflow
        /// <summary>Acknowledging confirms the ordering clinician was told about the finding.</summary>
        public void Acknowledge(Guid userId, DateTime at)
        {
            Acknowledged = true;
            Notified = true;
            AcknowledgedBy = userId;
            AcknowledgedAt = at;
        }
        #endregion
    }
}
