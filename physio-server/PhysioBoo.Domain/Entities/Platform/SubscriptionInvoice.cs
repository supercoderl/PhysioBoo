namespace PhysioBoo.Domain.Entities.Platform
{
    /// <summary>
    /// A charge for one billing period of a tenant subscription. Payment is recorded manually
    /// (reference from bank transfer / gateway); no card data is stored.
    /// </summary>
    public class SubscriptionInvoice : AuditEntity
    {
        #region Core Subscription Invoice Table (12)
        public Guid SubscriptionId { get; private set; }
        public Guid HospitalGroupId { get; private set; }
        public string InvoiceNumber { get; private set; }
        public string PlanName { get; private set; }
        public DateTime PeriodStart { get; private set; }
        public DateTime PeriodEnd { get; private set; }
        public decimal Amount { get; private set; }
        public string Currency { get; private set; }
        public SubscriptionInvoiceStatus Status { get; private set; }
        public DateTime IssuedAt { get; private set; }
        public DateTime DueDate { get; private set; }
        public DateTime? PaidAt { get; private set; }
        public string? PaymentReference { get; private set; }
        #endregion

        #region Navigation Properties
        public virtual TenantSubscription? Subscription { get; private set; }
        #endregion

        #region Constructor (11)
        public SubscriptionInvoice(
            Guid id,
            Guid subscriptionId,
            Guid hospitalGroupId,
            string invoiceNumber,
            string planName,
            DateTime periodStart,
            DateTime periodEnd,
            decimal amount,
            string currency,
            DateTime issuedAt,
            DateTime dueDate
        ) : base(id)
        {
            SubscriptionId = subscriptionId;
            HospitalGroupId = hospitalGroupId;
            InvoiceNumber = invoiceNumber;
            PlanName = planName;
            PeriodStart = periodStart;
            PeriodEnd = periodEnd;
            Amount = amount;
            Currency = currency;
            IssuedAt = issuedAt;
            DueDate = dueDate;
            Status = SubscriptionInvoiceStatus.Open;
        }
        #endregion

        #region Methods
        public void MarkPaid(DateTime paidAt, string? paymentReference)
        {
            Status = SubscriptionInvoiceStatus.Paid;
            PaidAt = paidAt;
            PaymentReference = paymentReference;
        }

        public void Void() { Status = SubscriptionInvoiceStatus.Void; }
        #endregion
    }
}
