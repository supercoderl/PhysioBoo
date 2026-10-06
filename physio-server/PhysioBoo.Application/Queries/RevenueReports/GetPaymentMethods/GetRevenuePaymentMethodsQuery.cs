using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetPaymentMethods
{
    public sealed record GetRevenuePaymentMethodsQuery(RevenueReportFilter Filter) : IRequest<List<PaymentMethodBreakdownViewModel>>;
}
