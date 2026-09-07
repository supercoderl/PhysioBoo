
using PhysioBoo.Application.ViewModels.Cashier;

namespace PhysioBoo.Application.Queries.Cashier.GetPaymentHistory
{
    public sealed record GetPaymentHistoryQuery(int Limit) : IRequest<List<CashierTransactionEventViewModel>>;
}
