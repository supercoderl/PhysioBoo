
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Cashier.SearchInvoices
{
    public sealed record SearchInvoicesQuery(PagedRequest<CashierInvoiceFilter> Request) : IRequest<PagedResult<CashierInvoiceViewModel>>;
}
