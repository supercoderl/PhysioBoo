using PhysioBoo.Domain.Entities.Core;




namespace PhysioBoo.Domain.Entities.Clinical
{
    public class PrescriptionClinicalWarning : TenantEntity
    {
        #region Core PrescriptionClinicalWarning Table (7)
        public Guid PrescriptionItemId { get; private set; }
        public ClinicalWarningType Type { get; private set; }
        public Severity Severity { get; private set; }
        public string Message { get; private set; }
        public string? RecommendedAction { get; private set; }
        public Guid? AcknowledgedBy { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? AcknowledgedByUser { get; private set; }
        public virtual PrescriptionItem? PrescriptionItem { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (7)
        public PrescriptionClinicalWarning(
            Guid id,
            Guid prescriptionItemId,
            ClinicalWarningType type,
            Severity severity,
            string message
        ) : base(id)
        {
            PrescriptionItemId = prescriptionItemId;
            Type = type;
            Severity = severity;
            Message = message;
        }
        #endregion

        #region Setter Methods (7)
        public void SetPrescriptionItemId(Guid prescriptionItemId)
        {
            PrescriptionItemId = prescriptionItemId;
        }

        public void SetType(ClinicalWarningType type)
        {
            Type = type;
        }

        public void SetSeverity(Severity severity)
        {
            Severity = severity;
        }

        public void SetMessage(string message)
        {
            Message = message;
        }

        public void SetRecommendedAction(string? recommendedAction)
        {
            RecommendedAction = recommendedAction;
        }

        public void Acknowledge(Guid acknowledgedBy)
        {
            AcknowledgedBy = acknowledgedBy;
            AcknowledgedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion
    }
}
