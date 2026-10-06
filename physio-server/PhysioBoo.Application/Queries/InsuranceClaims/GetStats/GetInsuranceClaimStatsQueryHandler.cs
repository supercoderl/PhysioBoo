using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetStats
{
    public sealed class GetInsuranceClaimStatsQueryHandler : IRequestHandler<GetInsuranceClaimStatsQuery, InsuranceClaimStatsViewModel>
    {
        private static readonly InsuranceClaimStatus[] s_pendingStatuses =
        {
            InsuranceClaimStatus.Draft,
            InsuranceClaimStatus.WaitingDocuments,
            InsuranceClaimStatus.ReadyToSubmit,
            InsuranceClaimStatus.Submitted,
            InsuranceClaimStatus.UnderReview,
            InsuranceClaimStatus.NeedCorrection
        };

        private readonly IInsuranceClaimRepository _claimRepository;

        public GetInsuranceClaimStatsQueryHandler(IInsuranceClaimRepository claimRepository)
        {
            _claimRepository = claimRepository;
        }

        public async Task<InsuranceClaimStatsViewModel> Handle(GetInsuranceClaimStatsQuery request, CancellationToken ct)
        {
            IQueryable<InsuranceClaim> query = _claimRepository.GetAllNoTracking(includeProperties: "InsuranceCompany,Documents");

            if (request.DateFrom.HasValue)
            {
                DateTime from = DateTime.SpecifyKind(request.DateFrom.Value.Date, DateTimeKind.Utc);
                query = query.Where(c => c.CreatedAt >= from);
            }

            if (request.DateTo.HasValue)
            {
                DateTime toExclusive = DateTime.SpecifyKind(request.DateTo.Value.Date.AddDays(1), DateTimeKind.Utc);
                query = query.Where(c => c.CreatedAt < toExclusive);
            }

            List<InsuranceClaim> claims = await query.AsSplitQuery().ToListAsync(ct);

            if (claims.Count == 0)
            {
                return new InsuranceClaimStatsViewModel { ClaimHealthScore = 100 };
            }

            List<InsuranceClaim> decided = claims
                .Where(c => c.SubmittedAt.HasValue && c.DecidedAt.HasValue)
                .OrderByDescending(c => c.DecidedAt)
                .ToList();

            int approved = claims.Count(c => c.Status is InsuranceClaimStatus.Approved or InsuranceClaimStatus.Settled);
            int rejected = claims.Count(c => c.Status == InsuranceClaimStatus.Rejected);
            int needsAttention = claims.Count(c =>
                c.Status is InsuranceClaimStatus.Rejected or InsuranceClaimStatus.NeedCorrection
                || c.MissingRequiredDocumentsCount() > 0);

            return new InsuranceClaimStatsViewModel
            {
                TotalClaims = claims.Count,
                PendingClaims = claims.Count(c => s_pendingStatuses.Contains(c.Status)),
                ApprovedClaims = approved,
                RejectedClaims = rejected,
                AppealedClaims = claims.Count(c => c.Status == InsuranceClaimStatus.Appealed),
                TotalClaimAmount = claims.Sum(c => c.ClaimAmount),
                TotalApprovedAmount = claims.Sum(c => c.ApprovedAmount ?? 0),
                AvgApprovalVelocityDays = decided.Count == 0
                    ? 0
                    : Math.Round(decided.Average(c => (c.DecidedAt!.Value - c.SubmittedAt!.Value).TotalDays), 1),
                MissingDocumentsCount = claims.Sum(c => c.MissingRequiredDocumentsCount()),
                RiskScoreAvg = Math.Round(claims.Average(c => (double)InsuranceClaimCardViewModel.CalculateRiskScore(c)), 1),
                // Share of the caseload that needs no corrective action.
                ClaimHealthScore = (int)Math.Round(100.0 * (claims.Count - needsAttention) / claims.Count),
                // Last 7 decisions, oldest first, for the sparkline.
                ApprovalVelocityTrend = decided
                    .Take(7)
                    .Reverse()
                    .Select(c => Math.Round((c.DecidedAt!.Value - c.SubmittedAt!.Value).TotalDays, 1))
                    .ToList()
            };
        }
    }
}
