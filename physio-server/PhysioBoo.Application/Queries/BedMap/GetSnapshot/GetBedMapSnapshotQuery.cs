using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Queries.BedMap.GetSnapshot
{
    public sealed record GetBedMapSnapshotQuery : IRequest<BedMapSnapshotViewModel>;
}
