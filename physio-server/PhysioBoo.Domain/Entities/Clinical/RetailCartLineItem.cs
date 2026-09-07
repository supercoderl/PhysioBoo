using PhysioBoo.Domain.Entities.Core;


namespace PhysioBoo.Domain.Entities.Clinical
{
    public class RetailCartLineItem : TenantEntity
    {
        #region Core Retail Cart Line Item Table (5)
        public Guid RetailCartId { get; private set; }
        public Guid MedicineId { get; private set; }
        public int Quantity { get; private set; }
        public decimal UnitPrice { get; private set; }
        public decimal DiscountPercent { get; private set; }
        public decimal InsuranceCoveredAmount { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual RetailCart? RetailCart { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (5)
        public RetailCartLineItem(
            Guid id,
            Guid retailCartId,
            Guid medicineId,
            int quantity,
            decimal unitPrice,
            decimal discountPercent,
            decimal insuranceCoveredAmount
        ) : base(id)
        {
            RetailCartId = retailCartId;
            MedicineId = medicineId;
            Quantity = quantity;
            UnitPrice = unitPrice;
            DiscountPercent = discountPercent;
            InsuranceCoveredAmount = insuranceCoveredAmount;
        }
        #endregion

        #region Setter Methods (5)
        public void SetQuantity(int quantity) { Quantity = quantity; }
        public void SetUnitPrice(decimal unitPrice) { UnitPrice = unitPrice; }
        public void SetDiscountPercent(decimal discountPercent) { DiscountPercent = discountPercent; }
        public void SetInsuranceCoveredAmount(decimal insuranceCoveredAmount) { InsuranceCoveredAmount = insuranceCoveredAmount; }

        public decimal Total() => Math.Round((UnitPrice * Quantity) * (1 - DiscountPercent / 100m) - InsuranceCoveredAmount, 2);
        #endregion
    }
}
