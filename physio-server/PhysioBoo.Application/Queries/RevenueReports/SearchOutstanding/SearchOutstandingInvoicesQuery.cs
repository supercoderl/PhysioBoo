using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchOutstanding
{
    public sealed record SearchOutstandingInvoicesQuery(PagedRequest<RevenueReportFilter> Request) : IRequest<PagedResult<OutstandingInvoiceViewModel>>;
}
