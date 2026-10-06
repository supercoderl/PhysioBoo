using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports.SearchDiscounts
{
    public sealed record SearchDiscountsQuery(PagedRequest<RevenueReportFilter> Request) : IRequest<PagedResult<DiscountRecordViewModel>>;
}
