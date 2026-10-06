using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetOutstandingSummary
{
    public sealed record GetOutstandingSummaryQuery(RevenueReportFilter Filter) : IRequest<List<OutstandingAgingSummaryViewModel>>;
}
