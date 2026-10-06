using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetAll
{
    public sealed class GetAllInsuranceClaimsQueryHandler : IRequestHandler<GetAllInsuranceClaimsQuery, PagedResult<InsuranceClaimCardViewModel>>
    {
        private readonly IInsuranceClaimRepository _claimRepository;

        public GetAllInsuranceClaimsQueryHandler(IInsuranceClaimRepository claimRepository)
        {
            _claimRepository = claimRepository;
        }

        public async Task<PagedResult<InsuranceClaimCardViewModel>> Handle(GetAllInsuranceClaimsQuery q, CancellationToken ct)
        {
            PagedRequest<InsuranceClaimFilter> request = q.Request;

            IQueryable<InsuranceClaim> query = _claimRepository
                .GetAllNoTracking(includeProperties: "InsuranceCompany,Patient,Documents");

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string pattern = $"%{request.Search.Trim()}%";
                query = query.Where(c =>
                    EF.Functions.ILike(c.ClaimNumber, pattern) ||
                    EF.Functions.ILike(c.PatientName, pattern) ||
                    EF.Functions.ILike(c.PolicyNumber, pattern) ||
                    (c.Patient != null && EF.Functions.ILike(c.Patient.PatientNumber, pattern)));
            }

            if (request.Filter != null)
            {
                if (!string.IsNullOrWhiteSpace(request.Filter.Status) && Enum.TryParse(request.Filter.Status, true, out InsuranceClaimStatus status))
                    query = query.Where(c => c.Status == status);

                if (request.Filter.ProviderId.HasValue)
                    query = query.Where(c => c.InsuranceCompanyId == request.Filter.ProviderId.Value);
            }

            int totalCount = await query.CountAsync(ct);
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 30 : request.PageSize;

            List<InsuranceClaim> claims = await query
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsSplitQuery()
                .ToListAsync(ct);

            return new PagedResult<InsuranceClaimCardViewModel>(
                totalCount,
                claims.Select(InsuranceClaimCardViewModel.FromEntity).ToList(),
                pageNumber,
                pageSize
            );
        }
    }
}
