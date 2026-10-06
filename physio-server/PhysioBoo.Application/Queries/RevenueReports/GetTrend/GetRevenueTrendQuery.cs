using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetTrend
{
    public sealed record GetRevenueTrendQuery(RevenueReportFilter Filter) : IRequest<List<RevenueTrendPointViewModel>>;
}
