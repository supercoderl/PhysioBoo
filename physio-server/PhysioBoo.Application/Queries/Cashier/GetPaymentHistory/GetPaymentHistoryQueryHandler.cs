
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Cashier.GetPaymentHistory
{
    public sealed class GetPaymentHistoryQueryHandler : IRequestHandler<GetPaymentHistoryQuery, List<CashierTransactionEventViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetPaymentHistoryQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<List<CashierTransactionEventViewModel>> Handle(GetPaymentHistoryQuery request, CancellationToken ct)
        {
            int limit = request.Limit <= 0 ? 50 : request.Limit;

            List<Payment> payments = await _paymentRepository
                .GetAllNoTracking(includeProperties: "Bill,Patient.Profile,Processor")
                .OrderByDescending(p => p.PaymentDate)
                .ThenByDescending(p => p.PaymentTime)
                .Take(limit)
                .ToListAsync(ct);

            return payments
                .SelectMany(p => CashierTransactionEventViewModel.FromPayment(p))
                .OrderByDescending(e => e.OccurredAt)
                .ToList();
        }
    }
}
