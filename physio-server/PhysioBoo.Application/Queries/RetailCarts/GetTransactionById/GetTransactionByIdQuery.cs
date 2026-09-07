
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.GetTransactionById
{
    public sealed record GetTransactionByIdQuery(Guid TransactionId) : IRequest<RetailTransactionViewModel?>;
}
