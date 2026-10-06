using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetDepartmentPerformance
{
    public sealed record GetRevenueByDepartmentQuery(RevenueReportFilter Filter) : IRequest<List<DepartmentRevenuePerformanceViewModel>>;
}
