
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Cashier.GetDashboardStats
{
    public sealed class GetCashierDashboardStatsQueryHandler : IRequestHandler<GetCashierDashboardStatsQuery, CashierDashboardStatsViewModel>
    {
        private readonly IBillRepository _billRepository;
        private readonly IPaymentRepository _paymentRepository;

        public GetCashierDashboardStatsQueryHandler(
            IBillRepository billRepository,
            IPaymentRepository paymentRepository
        )
        {
            _billRepository = billRepository;
            _paymentRepository = paymentRepository;
        }

        public async Task<CashierDashboardStatsViewModel> Handle(GetCashierDashboardStatsQuery request, CancellationToken ct)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

            List<Payment> todayPayments = await _paymentRepository
                .GetAllNoTracking(filter: p => p.PaymentDate == today)
                .ToListAsync(ct);

            List<Bill> outstandingBills = await _billRepository
                .GetAllNoTracking(filter: b => b.PaymentStatus == PaymentStatus.Pending || b.PaymentStatus == PaymentStatus.Partial)
                .ToListAsync(ct);

            decimal cashCollected = todayPayments.Where(p => p.Method == PaymentMethod.Cash && p.Status == PaymentStatus.Paid).Sum(p => p.Amount - p.RefundAmount);
            decimal cardPayments = todayPayments.Where(p => p.Method == PaymentMethod.Card && p.Status == PaymentStatus.Paid).Sum(p => p.Amount - p.RefundAmount);
            decimal insuranceClaims = todayPayments.Where(p => p.Method == PaymentMethod.Insurance && p.Status == PaymentStatus.Paid).Sum(p => p.Amount - p.RefundAmount);
            decimal totalCollected = todayPayments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount - p.RefundAmount);
            decimal refundAmount = todayPayments.Where(p => p.RefundAmount > 0 && p.RefundDate.HasValue && DateOnly.FromDateTime(p.RefundDate.Value) == today).Sum(p => p.RefundAmount);

            return new CashierDashboardStatsViewModel
            {
                TodayRevenue = totalCollected,
                CashCollected = cashCollected,
                CardPayments = cardPayments,
                InsuranceClaims = insuranceClaims,
                OutstandingBills = outstandingBills.Sum(b => b.OutstandingAmount),
                RefundAmount = refundAmount,
                CompletedTransactions = todayPayments.Count(p => p.Status == PaymentStatus.Paid),
                AveragePaymentTimeSeconds = 0
            };
        }
    }
}
