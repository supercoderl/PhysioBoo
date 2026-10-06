namespace PhysioBoo.Domain.Entities.Clinical
{
    /// <summary>
    /// Pharmacy-side working state for dispensing one prescription (one session per prescription).
    /// Created on the first pharmacist action; the prescription itself stays the source of truth
    /// for what was prescribed.
    /// </summary>
    public class DispenseSession : TenantEntity
    {
        #region Core Dispense Session Table (8)
        public Guid PrescriptionId { get; private set; }
        public DispenseStatus Status { get; private set; }
        public DateTime StartedAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public Guid? PharmacistId { get; private set; }
        public string? PharmacistNotes { get; private set; }
        public string? HoldReason { get; private set; }
        public string? CancelReason { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual Prescription? Prescription { get; private set; }
        public virtual ICollection<DispenseSessionItem> Items { get; private set; } = new List<DispenseSessionItem>();
        #endregion

        #region Constructor (4)
        public DispenseSession(
            Guid id,
            Guid prescriptionId,
            Guid? pharmacistId,
            DateTime startedAt
        ) : base(id)
        {
            PrescriptionId = prescriptionId;
            PharmacistId = pharmacistId;
            StartedAt = startedAt;
            Status = DispenseStatus.Verifying;
        }
        #endregion

        #region Methods
        public bool IsClosed => Status is DispenseStatus.Completed or DispenseStatus.Cancelled;

        public void SetPharmacistNotes(string? notes) { PharmacistNotes = notes; }

        public void Hold(string reason)
        {
            Status = DispenseStatus.OnHold;
            HoldReason = reason;
        }

        public void Cancel(string reason)
        {
            Status = DispenseStatus.Cancelled;
            CancelReason = reason;
        }

        public void Complete(Guid pharmacistId, string? notes, DateTime completedAt)
        {
            Status = DispenseStatus.Completed;
            PharmacistId = pharmacistId;
            PharmacistNotes = notes;
            CompletedAt = completedAt;
        }

        /// <summary>
        /// Starts another dispensing round for a partially dispensed prescription.
        /// Lines that still have quantity outstanding go back to picking; reservations are kept.
        /// </summary>
        public void Reopen(DateTime startedAt, Func<Guid, int> remainingQuantity)
        {
            Status = DispenseStatus.Verifying;
            StartedAt = startedAt;
            CompletedAt = null;
            HoldReason = null;

            foreach (DispenseSessionItem item in Items)
            {
                int remaining = remainingQuantity(item.PrescriptionItemId);
                if (remaining > 0 && item.Status == DispenseItemStatus.Dispensed)
                {
                    item.SetStatus(DispenseItemStatus.NotPicked);
                    item.SetQuantityToDispense(remaining);
                }
            }
        }

        /// <summary>
        /// Derives the working status from item progress (Verifying → Preparing → Dispensing).
        /// </summary>
        public void RefreshProgress(bool hasUnacknowledgedCritical)
        {
            if (IsClosed) return;

            HoldReason = null;

            if (hasUnacknowledgedCritical)
                Status = DispenseStatus.Verifying;
            else if (Items.Any(i => i.Status == DispenseItemStatus.NotPicked))
                Status = DispenseStatus.Preparing;
            else
                Status = DispenseStatus.Dispensing;
        }
        #endregion
    }
}
