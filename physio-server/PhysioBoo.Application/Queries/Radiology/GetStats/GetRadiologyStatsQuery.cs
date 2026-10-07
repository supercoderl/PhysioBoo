using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetStats
{
    public sealed record GetRadiologyStatsQuery() : IRequest<RadiologyStatsViewModel>;
}
