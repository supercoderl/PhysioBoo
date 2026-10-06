using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchTransactions
{
    public sealed record SearchRevenueTransactionsQuery(PagedRequest<RevenueReportFilter> Request) : IRequest<PagedResult<RevenueTransactionViewModel>>;
}
