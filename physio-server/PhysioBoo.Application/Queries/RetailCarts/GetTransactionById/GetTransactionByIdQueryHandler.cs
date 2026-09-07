
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RetailCarts.GetTransactionById
{
    public sealed class GetTransactionByIdQueryHandler : IRequestHandler<GetTransactionByIdQuery, RetailTransactionViewModel?>
    {
        private readonly IRetailTransactionRepository _retailTransactionRepository;

        public GetTransactionByIdQueryHandler(IRetailTransactionRepository retailTransactionRepository)
        {
            _retailTransactionRepository = retailTransactionRepository;
        }

        public async Task<RetailTransactionViewModel?> Handle(GetTransactionByIdQuery request, CancellationToken ct)
        {
            RetailTransaction? transaction = await _retailTransactionRepository.GetByIdAsync(
                request.TransactionId,
                includeProperties: "RetailTransactionLineItems,RetailPaymentSplits,Cashier",
                ct: ct
            );

            return transaction == null ? null : RetailTransactionViewModel.FromRetailTransaction(transaction);
        }
    }
}
