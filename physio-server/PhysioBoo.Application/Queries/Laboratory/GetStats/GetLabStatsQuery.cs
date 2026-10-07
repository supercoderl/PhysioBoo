using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Queries.Laboratory.GetStats
{
    public sealed record GetLabStatsQuery() : IRequest<LabStatsViewModel>;
}
