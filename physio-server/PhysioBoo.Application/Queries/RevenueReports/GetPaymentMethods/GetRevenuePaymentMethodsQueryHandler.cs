using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetPaymentMethods
{
    public sealed class GetRevenuePaymentMethodsQueryHandler : IRequestHandler<GetRevenuePaymentMethodsQuery, List<PaymentMethodBreakdownViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetRevenuePaymentMethodsQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<List<PaymentMethodBreakdownViewModel>> Handle(GetRevenuePaymentMethodsQuery request, CancellationToken ct)
        {
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(request.Filter);

            var groups = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), request.Filter, from, to)
                .GroupBy(p => p.Method)
                .Select(g => new { Method = g.Key, Amount = g.Sum(p => p.Amount), Count = g.Count() })
                .ToListAsync(ct);

            decimal total = groups.Sum(g => g.Amount);

            return groups
                .OrderByDescending(g => g.Amount)
                .Select(g => new PaymentMethodBreakdownViewModel
                {
                    Method = RevenueReportScope.MethodLabel(g.Method),
                    Amount = g.Amount,
                    Count = g.Count,
                    Percentage = total == 0 ? 0 : Math.Round((double)(g.Amount / total * 100), 1)
                })
                .ToList();
        }
    }
}
