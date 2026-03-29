using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class BillItem : TenantEntity
    {
        #region Core Bill Item Table (18)
        public Guid BillId { get; private set; }
        public ItemType Type { get; private set; }
        public string? ItemCode { get; private set; }
        public string? ItemName { get; private set; }
        public string? Description { get; private set; }
        public int Quantity { get; private set; }
        public decimal UnitPrice { get; private set; }
        public decimal DiscountPercentage { get; private set; }
        public decimal DiscountAmount { get; private set; }
        public decimal TaxPercentage { get; private set; }
        public decimal TaxAmount { get; private set; }
        public decimal TotalAmount { get; private set; }
        public Guid? PerformedBy { get; private set; }
        public DateTime? PerformedDate { get; private set; }
        public Guid? ReferenceId { get; private set; } // e.g., AppointmentId, ServiceId, MedicineId
        public bool IsInsuranceCovered { get; private set; }
        public decimal InsuranceCopayPercentage { get; private set; }

        public virtual Bill? Bill { get; private set; }
        public virtual User? PerformedByUser { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (18)
        public BillItem(
            Guid id,
            Guid billId,
            ItemType type,
            string? itemCode,
            string? itemName,
            string? description,
            decimal unitPrice,
            decimal totalAmount,
            Guid? performedBy,
            DateTime? performedDate,
            Guid? referenceId
        ) : base(id)
        {
            BillId = billId;
            Type = type;
            ItemCode = itemCode;
            ItemName = itemName;
            Description = description;
            Quantity = 1;
            UnitPrice = unitPrice;
            DiscountPercentage = 0;
            DiscountAmount = 0;
            TaxPercentage = 0;
            TaxAmount = 0;
            TotalAmount = totalAmount;
            PerformedBy = performedBy;
            PerformedDate = performedDate;
            ReferenceId = referenceId;
            IsInsuranceCovered = false;
            InsuranceCopayPercentage = 0;
        }
        #endregion

        #region Setter Methods (18)
        public void SetBillId(Guid billId) { BillId = billId; }
        public void SetType(ItemType type) { Type = type; }
        public void SetItemCode(string? itemCode) { ItemCode = itemCode; }
        public void SetItemName(string? itemName) { ItemName = itemName; }
        public void SetDescription(string? description) { Description = description; }
        public void SetQuantity(int quantity) { Quantity = quantity; }
        public void SetUnitPrice(decimal unitPrice) { UnitPrice = unitPrice; }
        public void SetDiscountPercentage(decimal discountPercentage) { DiscountPercentage = discountPercentage; }
        public void SetDiscountAmount(decimal discountAmount) { DiscountAmount = discountAmount; }
        public void SetTaxPercentage(decimal taxPercentage) { TaxPercentage = taxPercentage; }
        public void SetTaxAmount(decimal taxAmount) { TaxAmount = taxAmount; }
        public void SetTotalAmount(decimal totalAmount) { TotalAmount = totalAmount; }
        public void SetPerformedBy(Guid? performedBy) { PerformedBy = performedBy; }
        public void SetPerformedDate(DateTime? performedDate) { PerformedDate = performedDate; }
        public void SetReferenceId(Guid? referenceId) { ReferenceId = referenceId; }
        public void SetIsInsuranceCovered(bool isInsuranceCovered) { IsInsuranceCovered = isInsuranceCovered; }
        public void SetInsuranceCopayPercentage(decimal insuranceCopayPercentage) { InsuranceCopayPercentage = insuranceCopayPercentage; }
        #endregion
    }
}
