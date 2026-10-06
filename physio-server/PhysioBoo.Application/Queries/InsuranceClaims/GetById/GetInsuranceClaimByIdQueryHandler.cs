using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetById
{
    public sealed class GetInsuranceClaimByIdQueryHandler : IRequestHandler<GetInsuranceClaimByIdQuery, InsuranceClaimDetailViewModel?>
    {
        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly IMediatorHandler _bus;

        public GetInsuranceClaimByIdQueryHandler(
            IInsuranceClaimRepository claimRepository,
            IMediatorHandler bus
        )
        {
            _claimRepository = claimRepository;
            _bus = bus;
        }

        public async Task<InsuranceClaimDetailViewModel?> Handle(GetInsuranceClaimByIdQuery request, CancellationToken ct)
        {
            InsuranceClaim? claim = await _claimRepository
                .GetAllNoTracking(
                    filter: c => c.Id == request.Id,
                    includeProperties: "InsuranceCompany,Patient,Documents,Activities,Bill.BillItems"
                )
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (claim == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetInsuranceClaimByIdQuery),
                    $"Insurance claim with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            // Coverage already consumed on the same policy by other approved/settled claims.
            decimal usedCoverage = await _claimRepository
                .GetAllNoTracking(c =>
                    c.Id != claim.Id &&
                    c.InsuranceCompanyId == claim.InsuranceCompanyId &&
                    c.PolicyNumber == claim.PolicyNumber &&
                    (c.Status == InsuranceClaimStatus.Approved || c.Status == InsuranceClaimStatus.Settled))
                .SumAsync(c => c.ApprovedAmount ?? 0, ct);

            return InsuranceClaimDetailViewModel.FromEntity(claim, usedCoverage);
        }
    }
}
