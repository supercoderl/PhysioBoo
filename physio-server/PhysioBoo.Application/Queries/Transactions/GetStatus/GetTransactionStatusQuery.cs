
using PhysioBoo.Application.ViewModels.Transactions;

namespace PhysioBoo.Application.Queries.Transactions.GetStatus
{
    public sealed record GetTransactionStatusQuery(Guid Id) : IRequest<TransactionViewModel?>;
}
