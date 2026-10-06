using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetTrend
{
    public sealed class GetRevenueTrendQueryHandler : IRequestHandler<GetRevenueTrendQuery, List<RevenueTrendPointViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetRevenueTrendQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<List<RevenueTrendPointViewModel>> Handle(GetRevenueTrendQuery request, CancellationToken ct)
        {
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(request.Filter);

            var payments = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), request.Filter, from, to)
                .Select(p => new { p.PaymentDate, p.Method, p.Amount })
                .ToListAsync(ct);

            return RevenueReportScope.BuildTrend(payments.Select(p => (p.PaymentDate, p.Method, p.Amount)), from, to, request.Filter.Granularity);
        }
    }
}
