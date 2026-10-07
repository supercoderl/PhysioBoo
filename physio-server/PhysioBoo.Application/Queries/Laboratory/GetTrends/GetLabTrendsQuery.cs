using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Queries.Laboratory.GetTrends
{
    public sealed record GetLabTrendsQuery() : IRequest<LabDashboardTrendViewModel>;
}
