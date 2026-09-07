using PhysioBoo.Domain.Entities.Core;


namespace PhysioBoo.Domain.Entities.Clinical
{
    public class StockTakeItem : TenantEntity
    {
        #region Core Stock Take Item Table (6)
        public Guid StockTakeId { get; private set; }
        // Medicine-only for this pass — no generic ItemId/ItemType polymorphic reference, since no
        // catalog entity exists yet for Consumable/MedicalSupply/Equipment (see stock-take-redesign.md §17.0).
        public Guid MedicineInventoryId { get; private set; }
        // Snapshot at count start — copied, not live-referenced, so mid-count inventory changes
        // elsewhere don't corrupt the count.
        public int SystemQty { get; private set; }
        public int? ActualQty { get; private set; }
        public string? Reason { get; private set; }
        public string? Notes { get; private set; }
        public bool IsCounted { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual StockTake? StockTake { get; private set; }
        public virtual MedicineInventory? MedicineInventory { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (6)
        public StockTakeItem(
            Guid id,
            Guid stockTakeId,
            Guid medicineInventoryId,
            int systemQty
        ) : base(id)
        {
            StockTakeId = stockTakeId;
            MedicineInventoryId = medicineInventoryId;
            SystemQty = systemQty;
            IsCounted = false;
        }
        #endregion

        #region Setter Methods (6)
        public void RecordCount(int actualQty, string? reason, string? notes)
        {
            ActualQty = actualQty;
            Reason = reason;
            Notes = notes;
            IsCounted = true;
        }

        public int Difference() => (ActualQty ?? SystemQty) - SystemQty;
        #endregion
    }
}
