using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.InsuranceCompanies
{
    public sealed record CreateInsuranceCompanyViewModel
    (
        string Name,
        InsuranceType Type,
        string? ContactPerson,
        string? Phone,
        string? Email,
        string? Address,
        string? Website,
        bool CashlessFacility,
        bool ReimbursementFacility,
        string? NetworkHospitals,
        decimal? MaximumCoverageAmount,
        decimal? ClaimSettlementRatio,
        int AverageClaimSettlementTime,
        string[] RequiredDocuments,
        string? TermAndConditions
    );
}
