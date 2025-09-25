using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.InsuranceCompanies
{
    public sealed record CreateInsuranceCompanyViewModel
    (
        Guid Id,
        string Name,
        string? Code,
        InsuranceType Type,
        string? ContactPerson,
        string? Phone,
        string? Email,
        string? Address,
        string? Website,
        string? NetworkHospitals,
        decimal? MaximumCoverageAmount,
        decimal? ClaimSettlementRatio,
        int AverageClaimSettlementTime,
        string[] RequiredDocuments,
        string? TermAndConditions
    );
}
