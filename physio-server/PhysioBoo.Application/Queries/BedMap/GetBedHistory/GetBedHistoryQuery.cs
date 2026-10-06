using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Queries.BedMap.GetBedHistory
{
    public sealed record GetBedHistoryQuery(Guid BedId) : IRequest<List<BedHistoryEntryViewModel>>;
}
