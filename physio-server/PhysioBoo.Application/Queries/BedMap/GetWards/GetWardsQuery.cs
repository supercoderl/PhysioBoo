using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Queries.BedMap.GetWards
{
    public sealed record GetWardsQuery : IRequest<List<WardViewModel>>;
}
