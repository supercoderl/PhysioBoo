using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.InsuranceCompanies
{
    public sealed class InsuranceCompanyViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Code { get; set; }
        public InsuranceType Type { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public bool CashlessFacility { get; set; }
        public bool ReimbursementFacility { get; set; }
        public string? NetworkHospitals { get; set; }
        public decimal? MaximumCoverageAmount { get; set; }
        public decimal? ClaimSettlementRatio { get; set; }
        public int AverageClaimSettlementTime { get; set; }
        public string[] RequiredDocuments { get; set; } = Array.Empty<string>();
        public string? TermAndConditions { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static InsuranceCompanyViewModel FromInsuranceCompany(InsuranceCompany insuranceCompany)
        {
            return new InsuranceCompanyViewModel
            {
                Id = insuranceCompany.Id,
                Name = insuranceCompany.Name,
                Code = insuranceCompany.Code,
                Type = insuranceCompany.Type,
                ContactPerson = insuranceCompany.ContactPerson,
                Phone = insuranceCompany.Phone,
                Email = insuranceCompany.Email,
                Address = insuranceCompany.Address,
                Website = insuranceCompany.Website,
                CashlessFacility = insuranceCompany.CashlessFacility,
                ReimbursementFacility = insuranceCompany.ReimbursementFacility,
                NetworkHospitals = insuranceCompany.NetworkHospitals,
                MaximumCoverageAmount = insuranceCompany.MaximumCoverageAmount,
                ClaimSettlementRatio = insuranceCompany.ClaimSettlementRatio,
                AverageClaimSettlementTime = insuranceCompany.AverageClaimSettlementTime,
                RequiredDocuments = insuranceCompany.RequiredDocuments,
                TermAndConditions = insuranceCompany.TermAndConditions,
                IsActive = insuranceCompany.IsActive,
                CreatedAt = insuranceCompany.CreatedAt
            };
        }
    }
}
