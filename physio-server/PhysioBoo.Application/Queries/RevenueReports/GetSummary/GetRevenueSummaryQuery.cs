using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetSummary
{
    public sealed record GetRevenueSummaryQuery(RevenueReportFilter Filter) : IRequest<RevenueSummaryViewModel>;
}
