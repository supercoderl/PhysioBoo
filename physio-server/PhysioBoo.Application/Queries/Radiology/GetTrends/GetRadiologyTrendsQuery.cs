using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetTrends
{
    public sealed record GetRadiologyTrendsQuery() : IRequest<RadiologyDashboardTrendViewModel>;
}
