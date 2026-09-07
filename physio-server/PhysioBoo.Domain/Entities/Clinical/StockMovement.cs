using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.Support;


namespace PhysioBoo.Domain.Entities.Clinical
{
    public class StockMovement : TenantEntity
    {
        #region Core Stock Movement Table (8)
        public Guid MedicineId { get; private set; }
        public Guid? MedicineInventoryId { get; private set; }
        public StockMovementType Type { get; private set; }
        public int Quantity { get; private set; }
        public Guid? WarehouseZoneId { get; private set; }
        public Guid PerformedBy { get; private set; }
        public DateTime OccurredAt { get; private set; }
        public string? Reference { get; private set; }
        public string? Note { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? PerformedByUser { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual MedicineInventory? MedicineInventory { get; private set; }
        public virtual WarehouseZone? WarehouseZone { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (8)
        // Every field below is required at creation time — a StockMovement is never edited afterwards,
        // it is only ever created (append-only log).
        public StockMovement(
            Guid id,
            Guid medicineId,
            Guid? medicineInventoryId,
            StockMovementType type,
            int quantity,
            Guid? warehouseZoneId,
            Guid performedBy,
            string? reference,
            string? note
        ) : base(id)
        {
            MedicineId = medicineId;
            MedicineInventoryId = medicineInventoryId;
            Type = type;
            Quantity = quantity;
            WarehouseZoneId = warehouseZoneId;
            PerformedBy = performedBy;
            OccurredAt = SharedKernel.Utils.TimeZoneHelper.GetLocalTimeNow();
            Reference = reference;
            Note = note;
        }
        #endregion
    }
}
