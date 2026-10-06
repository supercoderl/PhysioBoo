using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetSummary
{
    public sealed class GetRevenueSummaryQueryHandler : IRequestHandler<GetRevenueSummaryQuery, RevenueSummaryViewModel>
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBillRepository _billRepository;

        public GetRevenueSummaryQueryHandler(IPaymentRepository paymentRepository, IBillRepository billRepository)
        {
            _paymentRepository = paymentRepository;
            _billRepository = billRepository;
        }

        public async Task<RevenueSummaryViewModel> Handle(GetRevenueSummaryQuery request, CancellationToken ct)
        {
            RevenueReportFilter filter = request.Filter;
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (DateOnly prevFrom, DateOnly prevTo) = RevenueReportScope.PreviousRange(filter);

            var payments = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, from, to)
                .Select(p => new { p.PaymentDate, p.Method, p.Amount, p.PatientId })
                .ToListAsync(ct);

            decimal previousRevenue = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, prevFrom, prevTo)
                .SumAsync(p => p.Amount, ct);

            List<decimal> refunds = await RevenueReportScope
                .RefundsIn(_paymentRepository.GetAllNoTracking(), filter, from, to)
                .Select(p => p.RefundAmount)
                .ToListAsync(ct);

            var bills = await RevenueReportScope
                .BillsIn(_billRepository.GetAllNoTracking(), filter, from, to)
                .Where(b => b.PaymentStatus != PaymentStatus.Cancelled)
                .Select(b => new { b.PatientId, b.TotalAmount, b.DiscountAmount, b.OutstandingAmount, b.PaymentStatus })
                .ToListAsync(ct);

            decimal totalRevenue = payments.Sum(p => p.Amount);
            decimal totalRefunds = refunds.Sum();
            var outstanding = bills.Where(b => b.OutstandingAmount > 0 && b.PaymentStatus != PaymentStatus.Waived).ToList();
            var discounted = bills.Where(b => b.DiscountAmount > 0).ToList();

            return new RevenueSummaryViewModel
            {
                TotalRevenue = totalRevenue,
                TotalRevenueGrowthPct = RevenueReportScope.GrowthPct(totalRevenue, previousRevenue),
                NetRevenue = totalRevenue - totalRefunds,
                TotalPatients = payments.Select(p => p.PatientId).Concat(bills.Select(b => b.PatientId)).Distinct().Count(),
                TotalTransactions = payments.Count,
                AverageBillValue = bills.Count == 0 ? 0 : Math.Round(bills.Average(b => b.TotalAmount), 2),
                OutstandingRevenue = outstanding.Sum(b => b.OutstandingAmount),
                OutstandingCount = outstanding.Count,
                TotalRefunds = totalRefunds,
                RefundCount = refunds.Count,
                TotalDiscounts = discounted.Sum(b => b.DiscountAmount),
                DiscountCount = discounted.Count,
                InsuranceRevenue = payments.Where(p => p.Method == PaymentMethod.Insurance).Sum(p => p.Amount),
                RevenueTrend = RevenueReportScope
                    .BuildTrend(payments.Select(p => (p.PaymentDate, p.Method, p.Amount)), from, to, filter.Granularity)
                    .Select(t => t.Total)
                    .ToList()
            };
        }
    }
}
