using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetInsuranceRevenue
{
    public sealed record GetRevenueByInsuranceQuery(RevenueReportFilter Filter) : IRequest<List<InsuranceProviderRevenueViewModel>>;
}
