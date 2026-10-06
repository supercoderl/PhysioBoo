using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetAll
{
    public sealed record GetAllInsuranceClaimsQuery(PagedRequest<InsuranceClaimFilter> Request) : IRequest<PagedResult<InsuranceClaimCardViewModel>>;
}
