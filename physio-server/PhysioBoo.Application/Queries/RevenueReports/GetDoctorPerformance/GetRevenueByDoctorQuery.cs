using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetDoctorPerformance
{
    public sealed record GetRevenueByDoctorQuery(RevenueReportFilter Filter) : IRequest<List<DoctorRevenuePerformanceViewModel>>;
}
