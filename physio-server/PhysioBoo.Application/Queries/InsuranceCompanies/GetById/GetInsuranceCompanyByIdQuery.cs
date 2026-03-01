using MediatR;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;

namespace PhysioBoo.Application.Queries.InsuranceCompanies.GetById
{
    public sealed record GetInsuranceCompanyByIdQuery(Guid Id) : IRequest<InsuranceCompanyViewModel?>;
}
