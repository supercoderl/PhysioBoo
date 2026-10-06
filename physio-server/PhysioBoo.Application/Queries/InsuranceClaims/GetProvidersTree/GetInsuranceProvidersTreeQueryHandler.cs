using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetProvidersTree
{
    public sealed class GetInsuranceProvidersTreeQueryHandler : IRequestHandler<GetInsuranceProvidersTreeQuery, List<InsuranceProviderNodeViewModel>>
    {
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;
        private readonly IInsuranceClaimRepository _claimRepository;

        public GetInsuranceProvidersTreeQueryHandler(
            IInsuranceCompanyRepository insuranceCompanyRepository,
            IInsuranceClaimRepository claimRepository
        )
        {
            _insuranceCompanyRepository = insuranceCompanyRepository;
            _claimRepository = claimRepository;
        }

        public async Task<List<InsuranceProviderNodeViewModel>> Handle(GetInsuranceProvidersTreeQuery request, CancellationToken ct)
        {
            var providers = await _insuranceCompanyRepository
                .GetAllNoTracking(filter: c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name })
                .ToListAsync(ct);

            var counts = await _claimRepository
                .GetAllNoTracking()
                .GroupBy(c => c.InsuranceCompanyId)
                .Select(g => new
                {
                    ProviderId = g.Key,
                    Total = g.Count(),
                    Pending = g.Count(c =>
                        c.Status != InsuranceClaimStatus.Approved &&
                        c.Status != InsuranceClaimStatus.Rejected &&
                        c.Status != InsuranceClaimStatus.Settled)
                })
                .ToDictionaryAsync(x => x.ProviderId, ct);

            return providers.Select(p => new InsuranceProviderNodeViewModel
            {
                Id = p.Id,
                Name = p.Name,
                ClaimCount = counts.TryGetValue(p.Id, out var c) ? c.Total : 0,
                PendingCount = counts.TryGetValue(p.Id, out var c2) ? c2.Pending : 0
            }).ToList();
        }
    }
}
