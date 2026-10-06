using PhysioBoo.Application.ViewModels.InsuranceClaims;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetById
{
    public sealed record GetInsuranceClaimByIdQuery(Guid Id) : IRequest<InsuranceClaimDetailViewModel?>;
}
