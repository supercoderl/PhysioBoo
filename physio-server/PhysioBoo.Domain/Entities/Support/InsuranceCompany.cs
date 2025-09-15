using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Support
{
    public class InsuranceCompany : Entity
    {
        #region Core Insurance Company Table (18)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public InsuranceType Type { get; private set; }
        public string? ContactPerson { get; private set; }
        public string? Phone { get; private set; }
        public string? Email { get; private set; }
        public string? Address { get; private set; }
        public string? Website { get; private set; }
        public bool CashlessFacility { get; private set; }
        public bool ReimbursementFacility { get; private set; }
        public string? NetworkHospitals { get; private set; } // JSONB
        public decimal? MaximumCoverageAmount { get; private set; }
        public decimal? ClaimSettlementRatio { get; private set; }
        public int AverageClaimSettlementTime { get; private set; } // in days
        public string[] RequiredDocuments { get; private set; }
        public string? TermAndConditions { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("InsuranceCompany")]
        public virtual ICollection<Bill> Bills { get; private set; } = new List<Bill>();
        #endregion

        #region Constructor (18)
        public InsuranceCompany(
            Guid id,
            string name,
            string? code,
            InsuranceType type,
            string? contactPerson,
            string? phone,
            string? email,
            string? address,
            string? website,
            string? networkHospitals,
            decimal? maximumCoverageAmount,
            decimal? claimSettlementRatio,
            int averageClaimSettlementTime,
            string[] requiredDocuments,
            string? termAndConditions
        ) : base(id)
        {
            Name = name;
            Code = code;
            Type = type;
            ContactPerson = contactPerson;
            Phone = phone;
            Email = email;
            Address = address;
            Website = website;
            CashlessFacility = false;
            ReimbursementFacility = true;
            NetworkHospitals = networkHospitals;
            MaximumCoverageAmount = maximumCoverageAmount;
            ClaimSettlementRatio = claimSettlementRatio;
            AverageClaimSettlementTime = averageClaimSettlementTime;
            RequiredDocuments = requiredDocuments;
            TermAndConditions = termAndConditions;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (18)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetType(InsuranceType type) { Type = type; }
        public void SetContactPerson(string? contactPerson) { ContactPerson = contactPerson; }
        public void SetPhone(string? phone) { Phone = phone; }
        public void SetEmail(string? email) { Email = email; }
        public void SetAddress(string? address) { Address = address; }
        public void SetWebsite(string? website) { Website = website; }
        public void SetCashlessFacility(bool cashlessFacility) { CashlessFacility = cashlessFacility; }
        public void SetReimbursementFacility(bool reimbursementFacility) { ReimbursementFacility = reimbursementFacility; }
        public void SetNetworkHospitals(string? networkHospitals) { NetworkHospitals = networkHospitals; }
        public void SetMaximumCoverageAmount(decimal? maximumCoverageAmount) { MaximumCoverageAmount = maximumCoverageAmount; }
        public void SetClaimSettlementRatio(decimal? claimSettlementRatio) { ClaimSettlementRatio = claimSettlementRatio; }
        public void SetAverageClaimSettlementTime(int averageClaimSettlementTime) { AverageClaimSettlementTime = averageClaimSettlementTime; }
        public void SetRequiredDocuments(string[] requiredDocuments) { RequiredDocuments = requiredDocuments; }
        public void SetTermAndConditions(string? termAndConditions) { TermAndConditions = termAndConditions; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
