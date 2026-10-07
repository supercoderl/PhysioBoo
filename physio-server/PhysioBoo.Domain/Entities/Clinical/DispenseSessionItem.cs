namespace PhysioBoo.Domain.Entities.Clinical
{
    /// <summary>
    /// Picking state of one prescription line: chosen batch, quantity, scan verification and substitution.
    /// </summary>
    public class DispenseSessionItem : TenantEntity
    {
        #region Core Dispense Session Item Table (9)
        public Guid SessionId { get; private set; }
        public Guid PrescriptionItemId { get; private set; }
        public Guid MedicineId { get; private set; }
        public Guid? MedicineInventoryId { get; private set; }
        public int QuantityToDispense { get; private set; }
        public int ReservedQuantity { get; private set; }
        public DispenseItemStatus Status { get; private set; }
        public Guid? ReplacedFromMedicineId { get; private set; }
        public string? ReplacementReason { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual DispenseSession? Session { get; private set; }
        public virtual PrescriptionItem? PrescriptionItem { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual MedicineInventory? MedicineInventory { get; private set; }
        #endregion

        #region Constructor (6)
        public DispenseSessionItem(
            Guid id,
            Guid sessionId,
            Guid prescriptionItemId,
            Guid medicineId,
            Guid? medicineInventoryId,
            int quantityToDispense
        ) : base(id)
        {
            SessionId = sessionId;
            PrescriptionItemId = prescriptionItemId;
            MedicineId = medicineId;
            MedicineInventoryId = medicineInventoryId;
            QuantityToDispense = quantityToDispense;
            Status = DispenseItemStatus.NotPicked;
        }
        #endregion

        #region Methods
        public void SetQuantityToDispense(int quantity) { QuantityToDispense = quantity; }
        public void SetStatus(DispenseItemStatus status) { Status = status; }
        public void SetReservedQuantity(int quantity) { ReservedQuantity = quantity; }

        public void SelectBatch(Guid? medicineInventoryId)
        {
            MedicineInventoryId = medicineInventoryId;
        }

        public void Replace(Guid alternativeMedicineId, Guid? batchId, string reason)
        {
            ReplacedFromMedicineId ??= MedicineId;
            MedicineId = alternativeMedicineId;
            MedicineInventoryId = batchId;
            ReplacementReason = reason;
            Status = DispenseItemStatus.Replaced;
        }

        /// <summary>
        /// Lines that leave the pharmacy when dispensing completes.
        /// </summary>
        [NotMapped]
        public bool IsReadyToDispense => QuantityToDispense > 0 && Status is DispenseItemStatus.Picked
            or DispenseItemStatus.Verified
            or DispenseItemStatus.Replaced;
        #endregion
    }
}
