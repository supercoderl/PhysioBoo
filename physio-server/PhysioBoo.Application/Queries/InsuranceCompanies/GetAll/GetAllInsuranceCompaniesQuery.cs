using MediatR;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.InsuranceCompanies.GetAll
{
    public sealed record GetAllInsuranceCompaniesQuery(
        PagedRequest<InsuranceCompanyFilter> Request
    ) : IRequest<PagedResult<InsuranceCompanyViewModel>>;
}
