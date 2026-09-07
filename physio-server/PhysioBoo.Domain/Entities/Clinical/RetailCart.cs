using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.PatientInformation;


namespace PhysioBoo.Domain.Entities.Clinical
{
    public class RetailCart : TenantEntity
    {
        #region Core Retail Cart Table (13)
        public string Name { get; private set; }
        public RetailCartStatus Status { get; private set; }
        public Guid HospitalId { get; private set; }

        // Customer is a snapshot on the cart itself, not a relationship — a walk-in customer may
        // have no Patient record at all, so this can't be a plain foreign key.
        public RetailCustomerType? CustomerType { get; private set; }
        public Guid? CustomerPatientId { get; private set; }
        public string? CustomerFullName { get; private set; }
        public string? CustomerPhone { get; private set; }
        public string? CustomerMrn { get; private set; }
        public string? CustomerInsuranceProvider { get; private set; }
        public decimal? CustomerInsuranceCoverageAmount { get; private set; }
        public int? CustomerLoyaltyPoints { get; private set; }
        public string? CustomerPrescriptionReference { get; private set; }
        public string? CustomerAllergyInformation { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual Patient? CustomerPatient { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<RetailCartLineItem> RetailCartLineItems { get; private set; } = new List<RetailCartLineItem>();
        #endregion

        #region Constructor (13)
        public RetailCart(
            Guid id,
            string name,
            Guid hospitalId
        ) : base(id)
        {
            Name = name;
            Status = RetailCartStatus.Active;
            HospitalId = hospitalId;
        }
        #endregion

        #region Setter Methods (13)
        public void SetName(string name) { Name = name; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }

        public void AttachCustomer(
            RetailCustomerType customerType,
            Guid? customerPatientId,
            string fullName,
            string phone,
            string? mrn,
            string? insuranceProvider,
            decimal? insuranceCoverageAmount,
            int? loyaltyPoints,
            string? prescriptionReference,
            string? allergyInformation
        )
        {
            CustomerType = customerType;
            CustomerPatientId = customerPatientId;
            CustomerFullName = fullName;
            CustomerPhone = phone;
            CustomerMrn = mrn;
            CustomerInsuranceProvider = insuranceProvider;
            CustomerInsuranceCoverageAmount = insuranceCoverageAmount;
            CustomerLoyaltyPoints = loyaltyPoints;
            CustomerPrescriptionReference = prescriptionReference;
            CustomerAllergyInformation = allergyInformation;
        }

        public void Suspend() { Status = RetailCartStatus.Held; }
        public void Resume() { Status = RetailCartStatus.Active; }
        #endregion
    }
}
