using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetInsuranceRevenue
{
    /// <summary>
    /// Insurance performance per provider, sourced from insurance claims created in the period.
    /// </summary>
    public sealed class GetRevenueByInsuranceQueryHandler : IRequestHandler<GetRevenueByInsuranceQuery, List<InsuranceProviderRevenueViewModel>>
    {
        private readonly IInsuranceClaimRepository _claimRepository;

        public GetRevenueByInsuranceQueryHandler(IInsuranceClaimRepository claimRepository)
        {
            _claimRepository = claimRepository;
        }

        public async Task<List<InsuranceProviderRevenueViewModel>> Handle(GetRevenueByInsuranceQuery request, CancellationToken ct)
        {
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(request.Filter);
            DateTime fromDt = from.ToDateTime(TimeOnly.MinValue);
            DateTime toExclusive = to.AddDays(1).ToDateTime(TimeOnly.MinValue);

            IQueryable<InsuranceClaim> query = _claimRepository
                .GetAllNoTracking(c => c.CreatedAt >= fromDt && c.CreatedAt < toExclusive);

            if (request.Filter.InsuranceProviderIds is { Count: > 0 })
                query = query.Where(c => request.Filter.InsuranceProviderIds.Contains(c.InsuranceCompanyId));

            var claims = await query
                .Select(c => new
                {
                    c.InsuranceCompanyId,
                    ProviderName = c.InsuranceCompany != null ? c.InsuranceCompany.Name : string.Empty,
                    c.Status,
                    c.ClaimAmount,
                    c.ApprovedAmount
                })
                .ToListAsync(ct);

            return claims
                .GroupBy(c => c.InsuranceCompanyId)
                .Select(g =>
                {
                    int approvedCount = g.Count(c => c.Status is InsuranceClaimStatus.Approved or InsuranceClaimStatus.Settled);
                    int rejectedCount = g.Count(c => c.Status == InsuranceClaimStatus.Rejected);
                    int decided = approvedCount + rejectedCount;

                    return new InsuranceProviderRevenueViewModel
                    {
                        ProviderId = g.Key,
                        ProviderName = g.First().ProviderName,
                        ClaimedAmount = g.Sum(c => c.ClaimAmount),
                        ApprovedAmount = g.Sum(c => c.ApprovedAmount ?? 0),
                        PendingAmount = g.Where(c => c.Status is not (InsuranceClaimStatus.Approved or InsuranceClaimStatus.Settled or InsuranceClaimStatus.Rejected)).Sum(c => c.ClaimAmount),
                        RejectedAmount = g.Where(c => c.Status == InsuranceClaimStatus.Rejected).Sum(c => c.ClaimAmount),
                        ClaimCount = g.Count(),
                        ApprovalRatePct = decided == 0 ? 0 : Math.Round(100.0 * approvedCount / decided, 1)
                    };
                })
                .OrderByDescending(p => p.ClaimedAmount)
                .ToList();
        }
    }
}
