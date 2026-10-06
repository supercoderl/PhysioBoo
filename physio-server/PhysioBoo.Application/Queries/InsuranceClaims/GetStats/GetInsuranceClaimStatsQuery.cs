using PhysioBoo.Application.ViewModels.InsuranceClaims;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetStats
{
    public sealed record GetInsuranceClaimStatsQuery(DateTime? DateFrom, DateTime? DateTo) : IRequest<InsuranceClaimStatsViewModel>;
}
