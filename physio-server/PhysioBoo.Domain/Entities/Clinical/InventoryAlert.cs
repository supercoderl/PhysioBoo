using PhysioBoo.Domain.Entities.Core;




namespace PhysioBoo.Domain.Entities.Clinical
{
    public class InventoryAlert : TenantEntity
    {
        #region Core Inventory Alert Table (7)
        public InventoryAlertType Type { get; private set; }
        public InventoryAlertSeverity Severity { get; private set; }
        public Guid? MedicineId { get; private set; }
        public string Message { get; private set; }
        public string? Recommendation { get; private set; }
        public Guid? AcknowledgedBy { get; private set; }
        public DateTime? AcknowledgedAt { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? AcknowledgedByUser { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (7)
        public InventoryAlert(
            Guid id,
            InventoryAlertType type,
            InventoryAlertSeverity severity,
            Guid? medicineId,
            string message,
            string? recommendation
        ) : base(id)
        {
            Type = type;
            Severity = severity;
            MedicineId = medicineId;
            Message = message;
            Recommendation = recommendation;
        }
        #endregion

        #region Setter Methods (7)
        // No SetType/SetSeverity/SetMessage on purpose — an alert's facts don't change after
        // it's raised; the only thing that can happen to it afterwards is being acknowledged.
        public void Acknowledge(Guid userId)
        {
            AcknowledgedBy = userId;
            AcknowledgedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion
    }
}
