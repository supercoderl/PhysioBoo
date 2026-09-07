
using PhysioBoo.Application.ViewModels.Cashier;

namespace PhysioBoo.Application.Queries.Cashier.GetInvoiceById
{
    public sealed record GetInvoiceByIdQuery(Guid InvoiceId) : IRequest<CashierInvoiceViewModel?>;
}
