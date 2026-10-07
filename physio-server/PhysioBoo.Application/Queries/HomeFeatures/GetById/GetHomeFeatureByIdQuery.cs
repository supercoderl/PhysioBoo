using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Queries.HomeFeatures.GetById
{
    public sealed record GetHomeFeatureByIdQuery(Guid Id) : IRequest<HomeFeatureViewModel?>;
}
