using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchRefunds
{
    public sealed record SearchRefundsQuery(PagedRequest<RevenueReportFilter> Request) : IRequest<PagedResult<RefundRecordViewModel>>;
}
