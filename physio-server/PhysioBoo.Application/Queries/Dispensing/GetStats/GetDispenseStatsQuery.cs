using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Application.Queries.Dispensing.GetStats
{
    public sealed record GetDispenseStatsQuery : IRequest<DispenseQueueStatsViewModel>;
}
