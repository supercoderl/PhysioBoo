using PhysioBoo.Domain.Entities.Core;



namespace PhysioBoo.Domain.Entities.Clinical
{
    public class RetailPaymentSplit : TenantEntity
    {
        #region Core Retail Payment Split Table (3)
        public Guid RetailTransactionId { get; private set; }
        public RetailPaymentMethod Method { get; private set; }
        public decimal Amount { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual RetailTransaction? RetailTransaction { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (3)
        public RetailPaymentSplit(
            Guid id,
            Guid retailTransactionId,
            RetailPaymentMethod method,
            decimal amount
        ) : base(id)
        {
            RetailTransactionId = retailTransactionId;
            Method = method;
            Amount = amount;
        }
        #endregion
    }
}
