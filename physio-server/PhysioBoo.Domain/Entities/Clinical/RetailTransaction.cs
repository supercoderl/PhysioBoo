using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.PatientInformation;



namespace PhysioBoo.Domain.Entities.Clinical
{
    public class RetailTransaction : TenantEntity
    {
        #region Core Retail Transaction Table (18)
        // Immutable snapshot created at checkout — never edited after creation, only superseded
        // by a linked refund (RetailTransaction.Status = Refunded).
        public string TransactionNumber { get; private set; }
        public Guid CashierId { get; private set; }
        public Guid HospitalId { get; private set; }

        public RetailCustomerType? CustomerType { get; private set; }
        public Guid? CustomerPatientId { get; private set; }
        public string? CustomerFullName { get; private set; }
        public string? CustomerPhone { get; private set; }
        public string? CustomerMrn { get; private set; }
        public string? CustomerInsuranceProvider { get; private set; }

        public decimal Subtotal { get; private set; }
        public decimal DiscountTotal { get; private set; }
        public decimal InsuranceCoverage { get; private set; }
        public decimal Vat { get; private set; }
        public decimal GrandTotal { get; private set; }
        public decimal AmountTendered { get; private set; }
        public decimal ChangeDue { get; private set; }
        public DateTime CompletedAt { get; private set; }
        public RetailTransactionStatus Status { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual User? Cashier { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual Patient? CustomerPatient { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<RetailTransactionLineItem> RetailTransactionLineItems { get; private set; } = new List<RetailTransactionLineItem>();
        public virtual ICollection<RetailPaymentSplit> RetailPaymentSplits { get; private set; } = new List<RetailPaymentSplit>();
        #endregion

        #region Constructor (18)
        public RetailTransaction(
            Guid id,
            string transactionNumber,
            Guid cashierId,
            Guid hospitalId,
            RetailCustomerType? customerType,
            Guid? customerPatientId,
            string? customerFullName,
            string? customerPhone,
            string? customerMrn,
            string? customerInsuranceProvider,
            decimal subtotal,
            decimal discountTotal,
            decimal insuranceCoverage,
            decimal vat,
            decimal grandTotal,
            decimal amountTendered
        ) : base(id)
        {
            TransactionNumber = transactionNumber;
            CashierId = cashierId;
            HospitalId = hospitalId;
            CustomerType = customerType;
            CustomerPatientId = customerPatientId;
            CustomerFullName = customerFullName;
            CustomerPhone = customerPhone;
            CustomerMrn = customerMrn;
            CustomerInsuranceProvider = customerInsuranceProvider;
            Subtotal = subtotal;
            DiscountTotal = discountTotal;
            InsuranceCoverage = insuranceCoverage;
            Vat = vat;
            GrandTotal = grandTotal;
            AmountTendered = amountTendered;
            ChangeDue = amountTendered - grandTotal;
            CompletedAt = TimeZoneHelper.GetLocalTimeNow();
            Status = RetailTransactionStatus.Completed;
        }
        #endregion

        #region Setter Methods (18)
        public void Refund() { Status = RetailTransactionStatus.Refunded; }
        #endregion
    }
}
