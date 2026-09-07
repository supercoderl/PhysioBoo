using PhysioBoo.Domain.Entities.Core;


namespace PhysioBoo.Domain.Entities.Clinical
{
    public class RetailTransactionLineItem : TenantEntity
    {
        #region Core Retail Transaction Line Item Table (7)
        // Frozen at sale time — deliberately NOT a foreign-key-only reference to a cart line, so a
        // later catalog price change never alters a historical transaction.
        public Guid RetailTransactionId { get; private set; }
        public Guid MedicineId { get; private set; }
        public string MedicineNameSnapshot { get; private set; }
        public int Quantity { get; private set; }
        public decimal UnitPriceSnapshot { get; private set; }
        public decimal DiscountPercent { get; private set; }
        public decimal InsuranceCoveredAmount { get; private set; }
        public decimal Total { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual RetailTransaction? RetailTransaction { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (7)
        public RetailTransactionLineItem(
            Guid id,
            Guid retailTransactionId,
            Guid medicineId,
            string medicineNameSnapshot,
            int quantity,
            decimal unitPriceSnapshot,
            decimal discountPercent,
            decimal insuranceCoveredAmount
        ) : base(id)
        {
            RetailTransactionId = retailTransactionId;
            MedicineId = medicineId;
            MedicineNameSnapshot = medicineNameSnapshot;
            Quantity = quantity;
            UnitPriceSnapshot = unitPriceSnapshot;
            DiscountPercent = discountPercent;
            InsuranceCoveredAmount = insuranceCoveredAmount;
            Total = Math.Round((unitPriceSnapshot * quantity) * (1 - discountPercent / 100m) - insuranceCoveredAmount, 2);
        }
        #endregion
    }
}
