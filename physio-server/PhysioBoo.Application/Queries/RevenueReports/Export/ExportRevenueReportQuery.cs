using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.Export
{
    public sealed record ExportRevenueReportQuery(RevenueReportFilter Filter) : IRequest<RevenueReportExportFile>;
}
