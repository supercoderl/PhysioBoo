using PhysioBoo.Application.ViewModels.Surgeries;

namespace PhysioBoo.Application.Queries.Surgeries.GetCaseDetail
{
    public sealed record GetSurgeryCaseQuery(Guid Id) : IRequest<SurgeryCaseViewModel?>;
}
