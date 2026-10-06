using PhysioBoo.Application.ViewModels.InsuranceClaims;

namespace PhysioBoo.Application.Queries.InsuranceClaims.GetProvidersTree
{
    public sealed record GetInsuranceProvidersTreeQuery : IRequest<List<InsuranceProviderNodeViewModel>>;
}
