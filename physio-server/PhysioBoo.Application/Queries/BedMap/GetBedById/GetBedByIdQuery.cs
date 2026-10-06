using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Queries.BedMap.GetBedById
{
    public sealed record GetBedByIdQuery(Guid Id) : IRequest<BedViewModel?>;
}
